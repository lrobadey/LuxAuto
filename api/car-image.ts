import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createCarImage } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand, description, context, tier, masterRef, latestRef } = await readJsonBody(req);
    const imageUrl = await createCarImage(
      brand || {},
      String(description || ''),
      String(context || ''),
      tier,
      masterRef,
      latestRef
    );
    sendJson(res, 200, { imageUrl });
  } catch (error) {
    console.error('car-image failed', error);
    sendJson(res, 500, { error: 'Failed to generate car image.' });
  }
}
