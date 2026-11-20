export interface StaticFallbackEnv {
  readonly AI_PROVIDER?: string;
  readonly AI_MODEL?: string;
  readonly GEMINI_API_KEY?: string;
  readonly OPENAI_API_KEY?: string;
  readonly CLAUDE_API_KEY?: string;
  readonly ELEVENLABS_API_KEY?: string;
  readonly ELEVENLABS_VOICE_ID?: string;
}

declare const __STATIC_FALLBACK_ENV__: StaticFallbackEnv | undefined;

const RAW_API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
)
  .trim()
  .replace(/\/+$/, '');

export const API_CONFIG = {
  CHAT_ENDPOINT: `${RAW_API_BASE}/api/chat`,
  TRANSCRIBE_ENDPOINT: `${RAW_API_BASE}/api/transcribe`,
  TTS_ENDPOINT: `${RAW_API_BASE}/api/tts`,
  SPEECH_RECOGNITION_LANG: 'en-US',
} as const;

export const STATIC_FALLBACK_ENV: StaticFallbackEnv =
  typeof __STATIC_FALLBACK_ENV__ !== 'undefined' ? __STATIC_FALLBACK_ENV__ : {};
