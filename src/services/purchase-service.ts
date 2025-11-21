import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { lessonPurchases } from '@/db/schema';

export type PurchasePayload = {
  lessonId: string;
  userId: string;
  price: number;
  reference?: string;
  metadata?: Record<string, unknown> | null;
};

export class PurchaseService {
  static async hasPurchased(lessonId: string, userId: string) {
    const purchase = await db.query.lessonPurchases.findFirst({
      where: and(eq(lessonPurchases.lessonId, lessonId), eq(lessonPurchases.userId, userId)),
    });

    return Boolean(purchase);
  }

  static async recordPurchase(payload: PurchasePayload) {
    const [record] = await db
      .insert(lessonPurchases)
      .values({
        lessonId: payload.lessonId,
        userId: payload.userId,
        pricePaid: payload.price,
        reference: payload.reference,
        metadata: payload.metadata ?? null,
      })
      .returning();

    return record;
  }
}
