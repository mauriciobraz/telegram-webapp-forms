// https://gist.github.com/zubiden/175bfed36ac186664de41f54c55e4327?permalink_comment_id=4172692#gistcomment-4172692

import { webcrypto } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { ok: boolean } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  if (!req.body.hash) {
    return res.status(400).json({
      error: 'Missing required field hash',
    });
  }

  const data = transformInitData(req.body.hash);
  const isOk = await validate(data, process.env.BOT_TOKEN!);

  if (isOk) {
    return res.status(200).json({ ok: true });
  }

  return res.status(403).json({
    error: 'Invalid hash',
  });
}

type TransformInitData = {
  [k: string]: string;
};

function transformInitData(initData: string): TransformInitData {
  return Object.fromEntries(new URLSearchParams(initData));
}

async function validate(data: TransformInitData, botToken: string) {
  const encoder = new TextEncoder();

  const checkString = Object.keys(data)
    .filter(key => key !== 'hash')
    .map(key => `${key}=${data[key]}`)
    .sort()
    .join('\n');

  const secretKey = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign']
  );

  const secret = await webcrypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(botToken)
  );

  const signatureKey = await webcrypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign']
  );

  const signature = await webcrypto.subtle.sign(
    'HMAC',
    signatureKey,
    encoder.encode(checkString)
  );

  const hex = [...new Uint8Array(signature)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return data.hash === hex;
}
