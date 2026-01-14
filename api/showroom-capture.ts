import { readJsonBody, sendJson, methodNotAllowed } from './_http.js';
import { createShowroomCapture } from './_gemini.js';
import { maybeUploadImageDataUrl } from './_blob.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  try {
    const { context, masterRef, latestRef } = await readJsonBody(req);
    const dataUrl = await createShowroomCapture(
      String(context || ''),
      masterRef,
      latestRef
    );
    const imageUrl = await maybeUploadImageDataUrl(dataUrl, 'showroom-captures');
    sendJson(res, 200, { imageUrl });
  } catch (error) {
    console.error('showroom-capture failed', error);
    sendJson(res, 500, { error: 'Failed to generate showroom capture.' });
  }
}
