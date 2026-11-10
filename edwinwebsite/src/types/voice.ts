export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ChatTurn {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly text: string;
}

/**
 * Discriminated Union making impossible voice states unrepresentable:
 * - `error` only exists in the `idle` state
 * - `interimTranscript` only exists in the `listening` state
 * - `query` only exists in the `thinking` state
 * - `responseText` only exists in the `speaking` state
 */
export type VoiceSessionStatus =
  | { readonly status: 'idle'; readonly error: string | null }
  | { readonly status: 'listening'; readonly interimTranscript: string }
  | { readonly status: 'thinking'; readonly query: string }
  | { readonly status: 'speaking'; readonly responseText: string };

export type VoiceAction =
  | { readonly type: 'START_LISTENING' }
  | { readonly type: 'UPDATE_INTERIM'; readonly transcript: string }
  | { readonly type: 'START_THINKING'; readonly query: string }
  | { readonly type: 'START_SPEAKING'; readonly responseText: string }
  | { readonly type: 'STOP_TO_IDLE' }
  | { readonly type: 'SET_ERROR'; readonly error: string };
