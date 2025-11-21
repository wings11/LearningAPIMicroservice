import type { AuthUser } from '@/middleware/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export {};
