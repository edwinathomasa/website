export const ENV = {
  GEMINI_API_KEY: import.meta.env.GEMINI_API_KEY?.trim() ?? '',
  ELEVENLABS_API_KEY: import.meta.env.ELEVENLABS_API_KEY?.trim() ?? '',
  ELEVENLABS_VOICE_ID: import.meta.env.ELEVENLABS_VOICE_ID?.trim() ?? '',
} as const;

export const API_CONFIG = {
  GEMINI_MODEL: 'gemini-2.5-flash',
  GEMINI_TEMPERATURE: 0.6,
  GEMINI_MAX_TOKENS: 220,
  ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io/v1/text-to-speech',
  ELEVENLABS_MODEL_ID: 'eleven_multilingual_v2',
  ELEVENLABS_STABILITY: 0.5,
  ELEVENLABS_SIMILARITY_BOOST: 0.75,
  SPEECH_RECOGNITION_LANG: 'en-US',
} as const;

export const ICON_SIZES = {
  XS: 13,
  SM: 14,
  MD: 16,
  LG: 24,
} as const;
