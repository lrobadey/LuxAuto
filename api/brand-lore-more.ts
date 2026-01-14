import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createAdditionalLore } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand, existingTitles } = await readJsonBody(req);
    const lore = await createAdditionalLore(brand || {}, Array.isArray(existingTitles) ? existingTitles : []);
    sendJson(res, 200, { lore });
  } catch (error) {
    console.error('brand-lore-more failed', error);
    sendJson(res, 500, { error: 'Failed to generate additional lore.' });
  }
}
