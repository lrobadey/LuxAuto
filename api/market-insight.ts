import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createMarketInsight } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand, model } = await readJsonBody(req);
    const insight = await createMarketInsight(brand || {}, model || {});
    sendJson(res, 200, { insight });
  } catch (error) {
    console.error('market-insight failed', error);
    sendJson(res, 500, { error: 'Failed to generate market insight.' });
  }
}
