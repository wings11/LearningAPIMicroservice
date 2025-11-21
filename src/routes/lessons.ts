import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';

import { optionalAuth, requireAuth } from '@/middleware/auth';
import { LessonService } from '@/services/lesson-service';

const LessonBodySchema = z.object({
  title: z.string().min(3),
  content: z.string().min(20),
  price: z.coerce.number().int().nonnegative(),
  isPublished: z.boolean().optional(),
});

const LessonUpdateSchema = LessonBodySchema.partial();

export const lessonsRoutes = fp(async (app: FastifyInstance) => {
  app.get('/lessons', { preHandler: optionalAuth() }, async (request, reply) => {
    const querySchema = z.object({ all: z.coerce.boolean().optional() });
    const query = querySchema.safeParse(request.query);
    const all = query.success && query.data.all && request.user?.role === 'admin';

    const lessons = all ? await LessonService.listAll() : await LessonService.listPublished();
    return reply.send({ lessons });
  });

  app.get('/lessons/:lessonId', { preHandler: optionalAuth() }, async (request, reply) => {
    const params = z.object({ lessonId: z.string().uuid() }).parse(request.params);
    const lesson = await LessonService.getById(params.lessonId);

    if (!lesson) {
      return reply.code(404).send({ error: 'Lesson not found' });
    }

    if (!lesson.isPublished && request.user?.role !== 'admin') {
      return reply.code(404).send({ error: 'Lesson not found' });
    }

    return reply.send({ lesson });
  });

  app.post('/lessons', { preHandler: requireAuth({ admin: true }) }, async (request, reply) => {
    const body = LessonBodySchema.parse(request.body);
    const lesson = await LessonService.createLesson(body);
    return reply.code(201).send({ lesson });
  });

  app.patch('/lessons/:lessonId', { preHandler: requireAuth({ admin: true }) }, async (request, reply) => {
    const params = z.object({ lessonId: z.string().uuid() }).parse(request.params);
    const body = LessonUpdateSchema.parse(request.body);

    const lesson = await LessonService.updateLesson(params.lessonId, body);

    if (!lesson) {
      return reply.code(404).send({ error: 'Lesson not found' });
    }

    return reply.send({ lesson });
  });
});
