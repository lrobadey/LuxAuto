import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createCarSpecs } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand, tier, requirements, existing, program } = await readJsonBody(req);
    const payload = await createCarSpecs(
      brand || {},
      tier,
      String(requirements || ''),
      Array.isArray(existing) ? existing : [],
      program
    );
    sendJson(res, 200, payload);
  } catch (error) {
    console.error('car-specs failed', error);
    sendJson(res, 500, { error: 'Failed to generate car specs.' });
  }
}
