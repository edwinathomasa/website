import type { ApiErrorResponse, ProfileResponse } from '@portfolio/shared';
import { API_CONFIG } from '../../constants/config';

export async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch(API_CONFIG.PROFILE_ENDPOINT, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let message = `Failed to load profile (HTTP ${response.status})`;
    try {
      const errBody = (await response.json()) as ApiErrorResponse;
      if (errBody?.error) {
        message = errBody.error;
      }
    } catch {
      // Ignore non-JSON error body
    }
    throw new Error(message);
  }

  return (await response.json()) as ProfileResponse;
}
