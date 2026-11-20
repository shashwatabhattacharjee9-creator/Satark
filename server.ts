import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  analyzeCallTranscript,
  getHealthPayload,
  mapGeminiError,
  scanWarrantImage,
  type IncomingTurn,
} from './src/server/geminiService';
import {
  getWaitlistStats,
  registerWaitlistLead,
  resendWaitlistConfirmation,
} from './src/server/waitlistService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '14mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json(getHealthPayload());
  });

  // 1. Real-Time Rolling 90-Second Call Threat Analyzer
  app.post('/api/satark/analyze-call', async (req: Request, res: Response) => {
    try {
      const body = req.body as { turns?: IncomingTurn[]; windowSeconds?: number };
      const result = await analyzeCallTranscript(body);
      return res.json(result);
    } catch (error) {
      const mapped = mapGeminiError(error);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // 2. Multimodal Warrant / Legal Notice Forensics Scanner
  app.post('/api/satark/scan-warrant', async (req: Request, res: Response) => {
    try {
      const body = req.body as { imageBase64?: string; mimeType?: string };
      const result = await scanWarrantImage(body);
      return res.json(result);
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
