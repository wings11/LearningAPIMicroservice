import { describe, expect, it } from 'vitest';

import { generateApiKey, hashApiKey } from '@/utils/api-key';

describe('API key utils', () => {
  it('generates unique hashes', () => {
    const first = generateApiKey();
    const second = generateApiKey();

    expect(first.plaintext).not.toEqual(second.plaintext);
    expect(first.hashed).toEqual(hashApiKey(first.plaintext));
    expect(second.hashed).toEqual(hashApiKey(second.plaintext));
  });
});
