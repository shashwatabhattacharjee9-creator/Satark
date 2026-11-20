import {
  readJsonBody,
  sendJson,
  type ServerlessRequest,
  type ServerlessResponse,
} from '../../src/server/httpAdapter.js';
import { registerWaitlistLead } from '../../src/server/waitlistService.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody<{
      name?: string;
      contact?: string;
      track?: 'family' | 'partner';
      familySize?: string;
      orgName?: string;
      partnerType?: string;
      note?: string;
      source?: string;
    }>(req);

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

    sendJson(res, 200, result);
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : 500;
    const message =
      error instanceof Error ? error.message : 'Failed to register for the Satark waiting list.';
    sendJson(res, status >= 400 && status < 600 ? status : 500, { error: message });
  }
}
