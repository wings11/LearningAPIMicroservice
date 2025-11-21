import { fetch } from 'undici';

import { env } from '@/config/env';

export type DebitPointsPayload = {
  userId: string;
  amount: number;
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};

export class PointsClient {
  static async debitPoints(payload: DebitPointsPayload) {
    const base = env.POINTS_API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/internal/points/debit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-learning-api-key': env.POINTS_SERVICE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error ?? 'Failed to debit points');
    }

    return response.json();
  }
}
