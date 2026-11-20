import { getHealthPayload } from '../src/server/geminiService.js';
import {
  sendJson,
  type ServerlessRequest,
  type ServerlessResponse,
} from '../src/server/httpAdapter.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  sendJson(res, 200, getHealthPayload());
}
