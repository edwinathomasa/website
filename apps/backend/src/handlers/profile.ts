import {
  calculateExperienceDuration,
  type ProfileResponse,
} from '@portfolio/shared';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { getProfileDocument } from '../db/mongoClient.js';
import { jsonResponse } from './http.js';

export async function handler(): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const profile = await getProfileDocument();
    if (!profile) {
      return jsonResponse(404, { error: 'Profile not found in database.' });
    }

    const duration = calculateExperienceDuration(profile.experience);
    const payload: ProfileResponse = {
      profile,
      meta: {
        experienceDuration: duration.formatted,
        experienceYears: duration.years,
      },
    };

    return jsonResponse(200, payload);
  } catch (err) {
    console.error('GET /api/profile error:', err);
    return jsonResponse(500, {
      error: err instanceof Error ? err.message : 'Failed to load profile.',
    });
  }
}
