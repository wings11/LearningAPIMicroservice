import { createHash, randomBytes } from 'node:crypto';

export type GeneratedApiKey = {
  plaintext: string;
  prefix: string;
  hashed: string;
};

export function generateApiKey(): GeneratedApiKey {
  const random = randomBytes(32).toString('hex');
  const plaintext = `lsk_${random}`;
  const prefix = plaintext.slice(0, 12);
  const hashed = hashApiKey(plaintext);

  return { plaintext, prefix, hashed };
}

export function hashApiKey(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
