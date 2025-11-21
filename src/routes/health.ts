import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const healthRoutes = fp(async (app: FastifyInstance) => {
  app.get('/health', async () => ({ status: 'ok' }));
});
