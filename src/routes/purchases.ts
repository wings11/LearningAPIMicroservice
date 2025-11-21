import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';

import { requireAuth } from '@/middleware/auth';
import { LessonService } from '@/services/lesson-service';
import { PurchaseService } from '@/services/purchase-service';
import { PointsClient } from '@/utils/points-client';

const PurchaseSchema = z.object({
  reference: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const purchasesRoutes = fp(async (app: FastifyInstance) => {
  app.post('/lessons/:lessonId/purchases', { preHandler: requireAuth() }, async (request, reply) => {
    const params = z.object({ lessonId: z.string().uuid() }).parse(request.params);
    const body = PurchaseSchema.parse(request.body ?? {});

    const lesson = await LessonService.getById(params.lessonId);
    if (!lesson || (!lesson.isPublished && request.user?.role !== 'admin')) {
      return reply.code(404).send({ error: 'Lesson not available' });
    }

    const alreadyOwned = await PurchaseService.hasPurchased(params.lessonId, request.user!.id);
    if (alreadyOwned) {
      return reply.send({ alreadyOwned: true });
    }

    await PointsClient.debitPoints({
      userId: request.user!.id,
      amount: lesson.price,
      reference: body.reference ?? `lesson:${lesson.id}`,
      metadata: {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        ...body.metadata,
      },
    });

    const purchase = await PurchaseService.recordPurchase({
      lessonId: lesson.id,
      userId: request.user!.id,
      price: lesson.price,
      reference: body.reference,
      metadata: body.metadata ?? null,
    });

    return reply.code(201).send({ purchase });
  });
});
