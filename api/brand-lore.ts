import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createBrandLore } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand } = await readJsonBody(req);
    const lore = await createBrandLore(brand || {});
    sendJson(res, 200, { lore });
  } catch (error) {
    console.error('brand-lore failed', error);
    sendJson(res, 500, { error: 'Failed to generate brand lore.' });
  }
}
