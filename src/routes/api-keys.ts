import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';

import { requireAuth } from '@/middleware/auth';
import { ApiKeyService } from '@/services/api-key-service';

export const apiKeysRoutes = fp(async (app: FastifyInstance) => {
  app.get('/admin/api-keys', { preHandler: requireAuth({ admin: true }) }, async () => {
    const keys = await ApiKeyService.listKeys();
    return { apiKeys: keys };
  });

  app.post('/admin/api-keys', { preHandler: requireAuth({ admin: true }) }, async (request, reply) => {
    const body = z.object({ name: z.string().min(3) }).parse(request.body);
    const apiKey = await ApiKeyService.createKey(body.name);
    return reply.code(201).send(apiKey);
  });
});
