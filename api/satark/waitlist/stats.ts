import {
  sendJson,
  type ServerlessRequest,
  type ServerlessResponse,
} from '../../../src/server/httpAdapter.js';
import { getWaitlistStats } from '../../../src/server/waitlistService.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    sendJson(res, 200, getWaitlistStats());
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to read waitlist stats.';
    sendJson(res, 500, { error: msg });
  }
}
