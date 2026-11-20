import {
  mapGeminiError,
  scanWarrantImage,
} from '../../src/server/geminiService.js';
import {
  readJsonBody,
  sendJson,
  type ServerlessRequest,
  type ServerlessResponse,
} from '../../src/server/httpAdapter.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody<{ imageBase64?: string; mimeType?: string }>(req);
    const result = await scanWarrantImage(body);
    sendJson(res, 200, result);
  } catch (error) {
    const mapped = mapGeminiError(error);
    sendJson(res, mapped.status, { error: mapped.message });
  }
}
