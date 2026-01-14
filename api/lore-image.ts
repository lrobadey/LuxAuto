import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createLoreImage } from './_gemini.js';
import { maybeUploadImageDataUrl } from './_blob.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { brand, lore } = await readJsonBody(req);
    const dataUrl = await createLoreImage(brand || {}, lore || {});
    const imageUrl = await maybeUploadImageDataUrl(dataUrl, 'lore-images');
    sendJson(res, 200, { imageUrl });
  } catch (error) {
    console.error('lore-image failed', error);
    sendJson(res, 500, { error: 'Failed to generate lore image.' });
  }
}
