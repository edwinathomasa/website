import type { Profile } from './profile.js';
import type { AiProvider, ChatMessage, SttProvider } from './voice.js';

export interface HealthResponse {
  readonly status: 'ok' | 'degraded';
  readonly db: 'connected' | 'disconnected';
  readonly providers: readonly AiProvider[];
  readonly ttsConfigured: boolean;
  readonly timestamp: string;
}

export interface ProfileResponse {
  readonly profile: Profile;
  readonly meta: {
    readonly experienceDuration: string;
    readonly experienceYears: number;
  };
}

export type ChatResponseSource =
  | 'custom_qa'
  | 'keyword_fallback'
  | 'llm'
  | 'local_fallback';

export interface ChatRequest {
  readonly messages: readonly ChatMessage[];
  readonly provider?: AiProvider;
  readonly model?: string;
}

export interface ChatResponse {
  readonly text: string;
  readonly source: ChatResponseSource;
  readonly provider?: AiProvider;
  readonly model?: string;
}

export interface TranscribeRequest {
  readonly audioBase64: string;
  readonly mimeType?: string;
}

export interface TranscribeResponse {
  readonly text: string;
  readonly provider?: SttProvider;
}

export interface SpeakRequest {
  readonly text: string;
}

export interface ApiErrorResponse {
  readonly error: string;
}
