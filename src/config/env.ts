import { config } from 'dotenv';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: envFile, override: false });

const EnvSchema = z
  .object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(4100),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().optional(),
    JWT_PUBLIC_KEY: z.string().optional(),
    POINTS_API_BASE_URL: z.string().url(),
    POINTS_SERVICE_API_KEY: z.string().min(1, 'POINTS_SERVICE_API_KEY is required'),
  })
  .refine(
    value => Boolean(value.JWT_SECRET) || Boolean(value.JWT_PUBLIC_KEY),
    'Either JWT_SECRET or JWT_PUBLIC_KEY must be provided',
  );

export const env = EnvSchema.parse(process.env);
export type Env = typeof env;
