import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { apiKeys } from '@/db/schema';
import { generateApiKey, hashApiKey } from '@/utils/api-key';

export class ApiKeyService {
  static async createKey(name: string) {
    const { plaintext, prefix, hashed } = generateApiKey();

    const [record] = await db
      .insert(apiKeys)
      .values({ name, prefix, hashedKey: hashed })
      .returning();

    return { id: record.id, apiKey: plaintext, prefix };
  }

  static async listKeys() {
    return db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .orderBy(desc(apiKeys.createdAt));
  }

  static async verifyKey(value: string) {
    const hashed = hashApiKey(value);
    const record = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.hashedKey, hashed),
    });

    if (!record || record.revokedAt) {
      return null;
    }

    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, record.id));

    return record;
  }
}
