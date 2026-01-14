import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createLaunchReviews } from './_gemini.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand, model } = await readJsonBody(req);
    const reviews = await createLaunchReviews(brand || {}, model || {});
    sendJson(res, 200, { reviews });
  } catch (error) {
    console.error('launch-reviews failed', error);
    sendJson(res, 500, { error: 'Failed to generate launch reviews.' });
  }
}
