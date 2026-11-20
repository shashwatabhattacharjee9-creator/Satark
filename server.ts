import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getWaitlistStats,
  registerWaitlistLead,
  resendWaitlistConfirmation,
} from './src/server/waitlistService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIMARY_GEMINI_MODEL = 'gemini-4-hydrogen';
const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';
const VALID_STAGES = new Set([
  'NOMINAL',
  'AUTHORITY_CLAIM',
  'ISOLATION_COERCION',
  'FINANCIAL_EXTORTION',
  'OTP_TRAP',
]);

function getGeminiClient(timeoutMs = 10_000): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured on the server. Add your Gemini API key in Settings > Secrets.'
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTimeoutOrTransientError(error: unknown): boolean {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const msg = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    status === 503 ||
    status === 504 ||
    status === 500 ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('deadline_exceeded')
  );
}

async function generateWithFallback(
  buildRequest: (model: string) => {
    contents: unknown;
    config: Record<string, unknown>;
  }
) {
  try {
    const ai = getGeminiClient(12_000);
    const req = buildRequest(PRIMARY_GEMINI_MODEL);
    const response = await ai.models.generateContent({
      model: PRIMARY_GEMINI_MODEL,
      contents: req.contents as Parameters<GoogleGenAI['models']['generateContent']>[0]['contents'],
      config: {
        ...req.config,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    return { response, model: PRIMARY_GEMINI_MODEL };
  } catch (primaryErr) {
    if (!isTimeoutOrTransientError(primaryErr)) {
      throw primaryErr;
    }
    const aiFallback = getGeminiClient(20_000);
    const fallbackReq = buildRequest(FALLBACK_GEMINI_MODEL);
    const response = await aiFallback.models.generateContent({
      model: FALLBACK_GEMINI_MODEL,
      contents: fallbackReq.contents as Parameters<
        GoogleGenAI['models']['generateContent']
      >[0]['contents'],
      config: fallbackReq.config,
    });
    return { response, model: FALLBACK_GEMINI_MODEL };
  }
}

function mapGeminiError(error: unknown): { status: number; message: string } {
  const rawMessage =
    error instanceof Error ? error.message : 'Unexpected error communicating with Gemini API.';
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : undefined;

  if (status === 503 && rawMessage.includes('GEMINI_API_KEY')) {
    return { status: 503, message: rawMessage };
  }
  if (
    status === 504 ||
    rawMessage.toLowerCase().includes('timeout') ||
    rawMessage.toLowerCase().includes('aborted') ||
    rawMessage.includes('DEADLINE_EXCEEDED')
  ) {
    return {
      status: 504,
      message: 'Gemini API request timed out. Please retry in a moment.',
    };
  }
  if (
    status === 401 ||
    status === 403 ||
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('PERMISSION_DENIED')
  ) {
    return {
      status: 403,
      message:
        'Gemini API authentication failed. Please verify your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Gemini API rate limit reached. Please wait a moment and try again.',
    };
  }
  return {
    status: status && status >= 400 && status < 600 ? status : 500,
    message: rawMessage,
  };
}

interface IncomingTurn {
  speaker?: string;
  text?: string;
  timestampMs?: number;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '14mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      model: PRIMARY_GEMINI_MODEL,
      fallbackModel: FALLBACK_GEMINI_MODEL,
      configured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
    });
  });

  // 1. Real-Time Rolling 90-Second Call Threat Analyzer
  app.post('/api/satark/analyze-call', async (req: Request, res: Response) => {
    try {
      const body = req.body as { turns?: IncomingTurn[]; windowSeconds?: number };
      const turns = Array.isArray(body?.turns) ? body.turns : [];

      const sanitizedTurns = turns
        .filter((t) => typeof t?.text === 'string' && t.text.trim().length > 0)
        .slice(-24)
        .map((t, index) => ({
          speaker: typeof t.speaker === 'string' && t.speaker.trim() ? t.speaker.trim() : 'Speaker',
          text: (t.text ?? '').trim().slice(0, 600),
          idx: index + 1,
        }));

      if (sanitizedTurns.length === 0) {
        return res.json({
          score: 0,
          stage: 'NOMINAL',
          reason: 'No active call utterances detected within the rolling 90-second window.',
        });
      }

      const transcriptBlock = sanitizedTurns
        .map((t) => `[Turn ${t.idx} — ${t.speaker}]: ${t.text}`)
        .join('\n');

      const { response, model } = await generateWithFallback(() => ({
        contents: `Evaluate this rolling 90-second live phone/video call transcript from India and output the scam risk JSON:\n\n${transcriptBlock}`,
        config: {
          systemInstruction: `You are Satark Live's real-time forensic call-scam detection engine protecting Indian families against:
1. Digital arrest scams (fake CBI, ED, TRAI, Mumbai/Delhi Cyber Crime, Narcotics, Customs officers threatening arrest on Skype/WhatsApp video calls).
2. Courier/parcel seizure scams in English, Hindi, or Hinglish (e.g. FedEx/DHL parcel seized at customs with illegal passport/MDMA/drugs, Aadhaar linked to money laundering).
3. Isolation & coercion tactics ("camera band mat karna", "stay on video call", "do not inform family", "lock the room", "non-disclosure agreement").
4. Financial extortion ("RBI safe custody account", "verification deposit", "transfer savings to clear case", "UPI/RTGS clearance").
5. Call-merge & OTP traps (asking to merge an incoming call, read out a 6-digit bank/UPI/WhatsApp OTP, install screen-sharing apps like AnyDesk/TeamViewer).
6. Victim panic/compliance ("please don't arrest me", "I am opening my banking app now", "transferring money now") — this signals imminent financial loss and MUST score 85-98 immediately!

Return ONLY valid JSON matching the schema:
- score: integer 0-100 representing real-time scam threat severity across the full rolling conversation:
  * 0-24: benign everyday conversation -> NOMINAL
  * 25-54: suspicious authority/courier claim without strong coercion yet -> AUTHORITY_CLAIM
  * 55-74: isolation threats, stay-on-camera orders, fake warrant/FIR pressure -> ISOLATION_COERCION
  * 75-100: active demand for money/RBI safe-custody transfer, victim complying/opening banking app -> FINANCIAL_EXTORTION (or OTP_TRAP if OTP/call-merge/screen-share is demanded)
- stage: strictly one of NOMINAL, AUTHORITY_CLAIM, ISOLATION_COERCION, FINANCIAL_EXTORTION, OTP_TRAP.
- reason: one crisp, authoritative forensic sentence (max 22 words) explaining the exact psychological or legal red flag observed.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: 'Real-time threat risk score from 0 to 100.',
              },
              stage: {
                type: Type.STRING,
                description:
                  'One of NOMINAL, AUTHORITY_CLAIM, ISOLATION_COERCION, FINANCIAL_EXTORTION, OTP_TRAP.',
              },
              reason: {
                type: Type.STRING,
                description: 'One concise forensic sentence explaining the risk score.',
              },
            },
            required: ['score', 'stage', 'reason'],
          },
        },
      }));

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText) as {
        score?: unknown;
        stage?: unknown;
        reason?: unknown;
      };

      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
      const rawStage = typeof parsed.stage === 'string' ? parsed.stage.trim().toUpperCase() : 'NOMINAL';
      const stage = VALID_STAGES.has(rawStage) ? rawStage : 'NOMINAL';
      const reason =
        typeof parsed.reason === 'string' && parsed.reason.trim().length > 0
          ? parsed.reason.trim()
          : 'Conversation evaluated across rolling 90-second threat window.';

      return res.json({
        score,
        stage,
        reason,
        model,
      });
    } catch (error) {
      const mapped = mapGeminiError(error);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // 2. Multimodal Warrant / Legal Notice Forensics Scanner
  app.post('/api/satark/scan-warrant', async (req: Request, res: Response) => {
    try {
      const body = req.body as { imageBase64?: string; mimeType?: string };
      let rawBase64 = typeof body?.imageBase64 === 'string' ? body.imageBase64.trim() : '';
      let mimeType =
        typeof body?.mimeType === 'string' && body.mimeType.startsWith('image/')
          ? body.mimeType
          : 'image/png';

      if (rawBase64.startsWith('data:')) {
        const match = rawBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          rawBase64 = match[2];
        }
      }

      if (!rawBase64 || rawBase64.length < 64) {
        return res.status(400).json({ error: 'Please provide a valid warrant or notice image to scan.' });
      }

      const { response, model } = await generateWithFallback(() => ({
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: rawBase64,
              },
            },
            {
              text: 'Perform a forensic legal & visual verification of this document under Indian law (BNS, BNSS, CrPC, IT Act, RBI guidelines, Supreme Court / CBI / Police procedure). Detect whether this is a forged digital arrest warrant/notice or an authentic document.',
            },
          ],
        },
        config: {
          systemInstruction: `You are Satark Live's Multimodal Warrant Forensics Engine specializing in Indian cybercrime & digital arrest scams.
Inspect every visual and textual detail of the uploaded image:
1. Legal validity: Verify cited Indian statutes (BNS has Sections 1-358 only — e.g. "Section 999 BNS" is fabricated; "Digital Arrest" does NOT exist in Indian law; no agency serves arrest warrants via WhatsApp/Skype/video call).
2. Financial red flags: Neither RBI, CBI, ED, nor courts have "safe custody accounts" or personal UPI IDs for asset verification.
3. Coercion & isolation language: Orders not to disconnect a video call or not to inform family members are hallmark scammer extortion.
4. Visual/typographic anomalies: Amateur seals, mixed fonts, grammar errors, fake letterheads, or inconsistent signatures.

Return ONLY valid JSON matching the schema:
- verdict: strictly "LIKELY FORGED" or "AUTHENTIC" (use "LIKELY FORGED" for any digital arrest notice, non-existent section, UPI/safe-custody demand, or forged letterhead; use "AUTHENTIC" only if it is clearly a benign/legitimate official document with zero coercion/fraud markers).
- confidence: integer 0-100.
- documentType: short label describing the scanned image.
- summary: crisp 1-2 sentence forensic verdict summary.
- redFlags: array of 3-5 concrete, specific forensic findings quoting actual details seen in the image.
- recommendedActions: array of 3 clear protective actions (include dialing 1930 / cybercrime.gov.in if forged).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.STRING,
                description: 'Either LIKELY FORGED or AUTHENTIC.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Forensic confidence score from 0 to 100.',
              },
              documentType: {
                type: Type.STRING,
                description: 'Short label for the document detected in the image.',
              },
              summary: {
                type: Type.STRING,
                description: 'Concise 1-2 sentence executive forensic conclusion.',
              },
              redFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Concrete visual, legal, and coercion red flags found in the image.',
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Immediate actionable safety steps for the user.',
              },
            },
            required: [
              'verdict',
              'confidence',
              'documentType',
              'summary',
              'redFlags',
              'recommendedActions',
            ],
          },
        },
      }));

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText) as {
        verdict?: unknown;
        confidence?: unknown;
        documentType?: unknown;
        summary?: unknown;
        redFlags?: unknown;
        recommendedActions?: unknown;
      };

      const verdictRaw = typeof parsed.verdict === 'string' ? parsed.verdict.toUpperCase() : '';
      const verdict = verdictRaw.includes('AUTHENTIC') && !verdictRaw.includes('NOT')
        ? 'AUTHENTIC'
        : 'LIKELY FORGED';

      return res.json({
        verdict,
        confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 90))),
        documentType:
          typeof parsed.documentType === 'string' && parsed.documentType.trim()
            ? parsed.documentType.trim()
            : 'Scanned Legal Notice',
        summary:
          typeof parsed.summary === 'string' && parsed.summary.trim()
            ? parsed.summary.trim()
            : 'Forensic verification completed.',
        redFlags: Array.isArray(parsed.redFlags)
          ? parsed.redFlags.filter((item): item is string => typeof item === 'string').slice(0, 6)
          : [],
        recommendedActions: Array.isArray(parsed.recommendedActions)
          ? parsed.recommendedActions
              .filter((item): item is string => typeof item === 'string')
              .slice(0, 4)
          : [],
        model,
      });
    } catch (error) {
      const mapped = mapGeminiError(error);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // 3. Real Beta Waitlist Registration + Automated Email / WhatsApp Confirmation
  app.get('/api/satark/waitlist/stats', (_req: Request, res: Response) => {
    try {
      return res.json(getWaitlistStats());
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to read waitlist stats.';
      return res.status(500).json({ error: msg });
    }
  });

  app.post('/api/satark/waitlist', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        name?: string;
        contact?: string;
        track?: 'family' | 'partner';
        familySize?: string;
        orgName?: string;
        partnerType?: string;
        note?: string;
        source?: string;
      };

      const result = await registerWaitlistLead({
        name: typeof body?.name === 'string' ? body.name : '',
        contact: typeof body?.contact === 'string' ? body.contact : '',
        track: body?.track === 'partner' ? 'partner' : 'family',
        familySize: typeof body?.familySize === 'string' ? body.familySize : undefined,
        orgName: typeof body?.orgName === 'string' ? body.orgName : undefined,
        partnerType: typeof body?.partnerType === 'string' ? body.partnerType : undefined,
        note: typeof body?.note === 'string' ? body.note : undefined,
        source: typeof body?.source === 'string' ? body.source : 'landing',
      });

      return res.json(result);
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: unknown }).status)
          : 500;
      const message =
        error instanceof Error ? error.message : 'Failed to register for the Satark waiting list.';
      return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
    }
  });

  app.post('/api/satark/waitlist/resend', async (req: Request, res: Response) => {
    try {
      const body = req.body as { ticketCode?: string; contact?: string };
      const lookup =
        typeof body?.ticketCode === 'string' && body.ticketCode.trim()
          ? body.ticketCode
          : typeof body?.contact === 'string'
            ? body.contact
            : '';

      const result = await resendWaitlistConfirmation(lookup);
      return res.json(result);
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: unknown }).status)
          : 500;
      const message =
        error instanceof Error ? error.message : 'Failed to resend waiting list confirmation.';
      return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
    }
  });

  // Mount Vite dev middleware in development, or serve built dist/ in production
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Satark server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
