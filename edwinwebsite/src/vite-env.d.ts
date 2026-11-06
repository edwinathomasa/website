/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GEMINI_API_KEY: string
  readonly ELEVENLABS_API_KEY: string
  readonly ELEVENLABS_VOICE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

