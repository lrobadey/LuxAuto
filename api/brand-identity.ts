import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createBrandIdentity } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { keywords, tone, brief } = await readJsonBody(req);
    const payload = await createBrandIdentity(String(keywords || ''), String(tone || ''), brief);
    sendJson(res, 200, payload);
  } catch (error) {
    console.error('brand-identity failed', error);
    sendJson(res, 500, { error: 'Failed to generate brand identity.' });
  }
}
