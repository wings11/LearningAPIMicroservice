import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';

import { lessonsRoutes } from '@/routes/lessons';
import { purchasesRoutes } from '@/routes/purchases';
import { apiKeysRoutes } from '@/routes/api-keys';
import { healthRoutes } from '@/routes/health';

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(helmet);
  await app.register(sensible);

  app.register(healthRoutes);
  app.register(lessonsRoutes);
  app.register(purchasesRoutes);
  app.register(apiKeysRoutes);

  return app;
}
