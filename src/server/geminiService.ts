import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export const PRIMARY_GEMINI_MODEL = process.env.VERCEL
  ? 'gemini-2.5-flash-lite'
  : 'gemini-3.1-flash-lite';
export const FALLBACK_GEMINI_MODEL = process.env.VERCEL
  ? 'gemini-2.5-flash'
  : 'gemini-2.5-flash-lite';

const VALID_STAGES = new Set([
  'NOMINAL',
  'AUTHORITY_CLAIM',
  'ISOLATION_COERCION',
  'FINANCIAL_EXTORTION',
  'OTP_TRAP',
]);

export interface IncomingTurn {
  speaker?: string;
  text?: string;
  timestampMs?: number;
}

const DEFAULT_MODEL_CHAIN: readonly string[] = process.env.VERCEL
  ? ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite']
  : ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-4-hydrogen'];

let cachedWorkingModel: string | null = null;
const unavailableModels = new Set<string>();
const clientCache = new Map<string, GoogleGenAI>();

function resolveGeminiApiKey(): string | null {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.API_KEY,
  ];
  for (const raw of candidates) {
    const cleaned =
      typeof raw === 'string' ? raw.trim().replace(/^["']|["']$/g, '') : '';
    if (cleaned && cleaned !== 'MY_GEMINI_API_KEY') {
      return cleaned;
    }
  }
  return null;
}

function getGeminiClient(timeoutMs = 12_000): GoogleGenAI {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Vercel Project Settings -> Environment Variables (Production + Preview) and Redeploy.'
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }
  const sdkTimeoutMs = Math.max(12_000, timeoutMs);
  const cacheKey = `${apiKey.slice(-8)}:${sdkTimeoutMs}`;
  const existing = clientCache.get(cacheKey);
  if (existing) return existing;

  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: sdkTimeoutMs,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  clientCache.set(cacheKey, client);
  return client;
}

function isModelNotFoundError(error: unknown): boolean {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const msg = error instanceof Error ? error.message.toLowerCase() : '';
  return status === 404 || msg.includes('not found') || msg.includes('not_found');
}

function isTimeoutOrTransientError(error: unknown): boolean {
  if (isModelNotFoundError(error)) return true;
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const msg = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    status === 503 ||
    status === 504 ||
    status === 500 ||
    status === 429 ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('deadline_exceeded')
  );
}

function getFastConfigForModel(
  model: string,
  baseConfig: Record<string, unknown>
): Record<string, unknown> {
  if (model === 'gemini-3.1-flash-lite') {
    return {
      ...baseConfig,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    };
  }
  if (model.startsWith('gemini-4-')) {
    return {
      ...baseConfig,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    };
  }
  if (model.startsWith('gemini-2.5-')) {
    return {
      ...baseConfig,
      thinkingConfig: { thinkingBudget: 0 },
    };
  }
  return baseConfig;
}

function buildOrderedModelList(): string[] {
  const ordered: string[] = [];
  if (cachedWorkingModel && !unavailableModels.has(cachedWorkingModel)) {
    ordered.push(cachedWorkingModel);
  }
  for (const m of DEFAULT_MODEL_CHAIN) {
    if (!unavailableModels.has(m) && !ordered.includes(m)) {
      ordered.push(m);
    }
  }
  return ordered.length > 0 ? ordered : [...DEFAULT_MODEL_CHAIN];
}

function withHardTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(`${label} timed out after ${ms}ms`) as Error & { status?: number };
      err.status = 504;
      reject(err);
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function generateWithFallback(
  buildRequest: (model: string) => {
    contents: unknown;
    config: Record<string, unknown>;
  },
  attemptTimeoutMs = 6_500
) {
  const models = buildOrderedModelList();
  let lastError: unknown;

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    try {
      const ai = getGeminiClient(attemptTimeoutMs);
      const req = buildRequest(model);
      const response = await withHardTimeout(
        ai.models.generateContent({
          model,
          contents: req.contents as Parameters<
            GoogleGenAI['models']['generateContent']
          >[0]['contents'],
          config: getFastConfigForModel(model, req.config),
        }),
        attemptTimeoutMs,
        `Gemini (${model})`
      );
      cachedWorkingModel = model;
      return { response, model };
    } catch (err) {
      lastError = err;
      if (isModelNotFoundError(err)) {
        unavailableModels.add(model);
        if (cachedWorkingModel === model) cachedWorkingModel = null;
      }
      const isLast = i === models.length - 1;
      if (isLast || !isTimeoutOrTransientError(err)) {
        throw err;
      }
    }
  }

  throw lastError;
}

export function mapGeminiError(error: unknown): { status: number; message: string } {
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
        'Gemini API authentication failed. Verify your GEMINI_API_KEY in Environment Variables / Secrets.',
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

export function getHealthPayload() {
  return {
    ok: true,
    model: PRIMARY_GEMINI_MODEL,
    fallbackModel: FALLBACK_GEMINI_MODEL,
    configured: Boolean(resolveGeminiApiKey()),
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'express-node',
  };
}

export async function analyzeCallTranscript(body: {
  turns?: IncomingTurn[];
  windowSeconds?: number;
}) {
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
    return {
      score: 0,
      stage: 'NOMINAL',
      reason: 'No active call utterances detected within the rolling 90-second window.',
    };
  }

  const transcriptBlock = sanitizedTurns
    .map((t) => `[Turn ${t.idx} — ${t.speaker}]: ${t.text}`)
    .join('\n');

  const { response, model } = await generateWithFallback(
    () => ({
      contents: `Score this live Indian call transcript (90s rolling window) as JSON:\n${transcriptBlock}`,
      config: {
        systemInstruction: `You are Satark Live's real-time Indian call-scam forensic classifier. Detect:
1. Digital arrest scams (fake CBI/ED/TRAI/Cyber Crime/Customs/Narcotics video-call arrest threats; note live speech-to-text often mishears "digital arrest" as "digital age", "digital address", or "digital artist" — treat "under digital age/address/arrest" as a digital arrest threat!).
2. Courier/parcel seizure scams (English/Hindi/Hinglish: FedEx/DHL parcel seized at customs, drugs/passport, Aadhaar money laundering).
3. Isolation/coercion ("camera band mat karna", "stay on video call", "do not inform family", "lock the room", "NDA").
4. Financial extortion ("RBI safe custody account", "verification deposit", "UPI/RTGS clearance").
5. Call-merge & OTP/screen-share traps (merge call, read 6-digit OTP, install AnyDesk/TeamViewer).
6. Victim panic/compliance ("don't arrest me", "opening my banking app", "transferring money") -> score 85-98 immediately.

Scoring bands:
- 0-24: benign -> NOMINAL
- 25-54: authority/courier claim without strong coercion -> AUTHORITY_CLAIM
- 55-74: isolation threats, stay-on-camera, digital arrest claim, fake warrant/FIR -> ISOLATION_COERCION
- 75-100: money/RBI transfer demand, active digital arrest threat with coercion, or victim complying -> FINANCIAL_EXTORTION (or OTP_TRAP for OTP/call-merge/screen-share).

Output ONLY JSON: { score (0-100 int), stage (exact enum), reason (1 crisp sentence <= 20 words) }.`,
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
    }),
    5_500
  );

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

  return {
    score,
    stage,
    reason,
    model,
  };
}

export async function scanWarrantImage(body: {
  imageBase64?: string;
  mimeType?: string;
}) {
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
    const err = new Error(
      'Please provide a valid warrant or notice image to scan.'
    ) as Error & { status?: number };
    err.status = 400;
    throw err;
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
  }), 16_000);

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
  const verdict =
    verdictRaw.includes('AUTHENTIC') && !verdictRaw.includes('NOT')
      ? 'AUTHENTIC'
      : 'LIKELY FORGED';

  return {
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
  };
}
