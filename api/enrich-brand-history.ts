import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { expandBrandHistory } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand } = await readJsonBody(req);
    const history = await expandBrandHistory(brand || {});
    sendJson(res, 200, { history });
  } catch (error) {
    console.error('enrich-brand-history failed', error);
    sendJson(res, 500, { error: 'Failed to enrich brand history.' });
  }
}
