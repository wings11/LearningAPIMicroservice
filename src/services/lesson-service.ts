import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { lessons } from '@/db/schema';

export type LessonPayload = {
  title: string;
  content: string;
  price: number;
  isPublished?: boolean;
};

export class LessonService {
  static async listPublished() {
    return db
      .select()
      .from(lessons)
      .where(and(eq(lessons.isPublished, true), eq(lessons.status, 'active')))
      .orderBy(desc(lessons.createdAt));
  }

  static async listAll() {
    return db.select().from(lessons).orderBy(desc(lessons.createdAt));
  }

  static async getById(id: string) {
    return db.query.lessons.findFirst({ where: eq(lessons.id, id) });
  }

  static async createLesson(payload: LessonPayload) {
    const [record] = await db
      .insert(lessons)
      .values({
        title: payload.title,
        content: payload.content,
        price: payload.price,
        status: payload.isPublished ? 'active' : 'draft',
        isPublished: payload.isPublished ?? false,
      })
      .returning();

    return record;
  }

  static async updateLesson(id: string, payload: Partial<LessonPayload>) {
    const [record] = await db
      .update(lessons)
      .set({
        ...payload,
        status: payload.isPublished === undefined
          ? undefined
          : payload.isPublished
            ? 'active'
            : 'draft',
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, id))
      .returning();

    return record;
  }
}
