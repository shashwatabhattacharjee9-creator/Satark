import {
  readJsonBody,
  sendJson,
  type ServerlessRequest,
  type ServerlessResponse,
} from '../../../src/server/httpAdapter.js';
import { resendWaitlistConfirmation } from '../../../src/server/waitlistService.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody<{ ticketCode?: string; contact?: string }>(req);
    const lookup =
      typeof body?.ticketCode === 'string' && body.ticketCode.trim()
        ? body.ticketCode
        : typeof body?.contact === 'string'
          ? body.contact
          : '';

    const result = await resendWaitlistConfirmation(lookup);
    sendJson(res, 200, result);
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : 500;
    const message =
      error instanceof Error ? error.message : 'Failed to resend waiting list confirmation.';
    sendJson(res, status >= 400 && status < 600 ? status : 500, { error: message });
  }
}
