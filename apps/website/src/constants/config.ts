const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

export const API_CONFIG = {
  HEALTH_ENDPOINT: `${RAW_API_BASE}/api/health`,
  PROFILE_ENDPOINT: `${RAW_API_BASE}/api/profile`,
  CHAT_ENDPOINT: `${RAW_API_BASE}/api/chat`,
  TRANSCRIBE_ENDPOINT: `${RAW_API_BASE}/api/transcribe`,
  SPEAK_ENDPOINT: `${RAW_API_BASE}/api/speak`,
  SPEECH_RECOGNITION_LANG: 'en-US',
} as const;
