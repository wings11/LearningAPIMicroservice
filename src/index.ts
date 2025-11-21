import { buildServer } from '@/server';
import { env } from '@/config/env';

async function start() {
  const app = await buildServer();

  try {
    await app.listen({ host: '0.0.0.0', port: env.PORT });
    app.log.info(`Learning API running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error, 'Failed to start server');
    process.exit(1);
  }
}

start();
