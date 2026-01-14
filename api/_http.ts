export const readJsonBody = async (req: any) => {
  if (req.body) {
    if (typeof req.body === 'string') {
      return req.body.length > 0 ? JSON.parse(req.body) : {};
    }
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export const sendJson = (res: any, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export const methodNotAllowed = (res: any, allowed = 'POST') => {
  res.statusCode = 405;
  res.setHeader('Allow', allowed);
  res.end('Method Not Allowed');
};
