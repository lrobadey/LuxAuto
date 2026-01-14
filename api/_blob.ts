import { put } from '@vercel/blob';

const parseDataUrl = (dataUrl: string) => {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const mimeType = match[1] || 'application/octet-stream';
  const base64 = match[2] || '';
  return { mimeType, base64 };
};

const extFromMimeType = (mimeType: string) => {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('webp')) return 'webp';
  return 'png';
};

export const maybeUploadImageDataUrl = async (
  dataUrl: string,
  folder: string
): Promise<string> => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return dataUrl;
  if (!dataUrl.startsWith('data:image')) return dataUrl;

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return dataUrl;

  const ext = extFromMimeType(parsed.mimeType);
  const pathname = `${folder}/${crypto.randomUUID()}.${ext}`;
  const body = Buffer.from(parsed.base64, 'base64');

  const blob = await put(pathname, body, {
    access: 'public',
    contentType: parsed.mimeType
  });

  return blob.url;
};

