import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL ||= 'postgres://postgres:postgres@localhost:5432/learning_service_test';
process.env.JWT_SECRET ||= 'test-secret';
process.env.POINTS_API_BASE_URL ||= 'http://localhost:3000';
process.env.POINTS_SERVICE_API_KEY ||= 'test';
process.env.NODE_ENV = 'test';

let server: Awaited<ReturnType<Awaited<typeof import('@/server')>['buildServer']>>;

beforeAll(async () => {
  const module = await import('@/server');
  server = await module.buildServer();
});

describe('health endpoint', () => {
  it('returns ok', async () => {
    const response = await server.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
