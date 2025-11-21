import type { FastifyReply, FastifyRequest } from 'fastify';
import { createPublicKey, createSecretKey } from 'node:crypto';
import { jwtVerify } from 'jose';

import { env } from '@/config/env';
import { ApiKeyService } from '@/services/api-key-service';

export type AuthUser = {
  id: string;
  email?: string;
  role?: string;
};

const jwtKey = env.JWT_SECRET
  ? createSecretKey(Buffer.from(env.JWT_SECRET, 'utf-8'))
  : createPublicKey(env.JWT_PUBLIC_KEY!);

async function authenticateRequest(request: FastifyRequest): Promise<AuthUser | null> {
  if (request.user) {
    return request.user;
  }

  const authHeader = request.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;
  const cookieToken = (request.cookies as Record<string, string | undefined>)?.['auth-token'];
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwtKey);
    const id = (payload.sub as string) ?? (payload.id as string);

    if (!id) {
      return null;
    }

    const user: AuthUser = {
      id,
      email: payload.email as string | undefined,
      role: (payload.role as string | undefined) ?? 'user',
    };
    request.user = user;
    return user;
  } catch (error) {
    request.log.warn({ err: error }, 'JWT verification failed');
    return null;
  }
}

export function requireAuth(options?: { admin?: boolean }) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      return reply.unauthorized('Authentication required');
    }

    if (options?.admin && user.role !== 'admin') {
      return reply.forbidden('Admin privileges required');
    }
  };
}

export function optionalAuth() {
  return async (request: FastifyRequest) => {
    await authenticateRequest(request);
  };
}

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  const headerKey = request.headers['x-learning-api-key'];
  if (typeof headerKey !== 'string') {
    return reply.unauthorized('x-learning-api-key header missing');
  }

  const apiKey = await ApiKeyService.verifyKey(headerKey);
  if (!apiKey) {
    return reply.unauthorized('Invalid API key');
  }

  request.log.debug({ apiKeyId: apiKey.id }, 'API key validated');
}
