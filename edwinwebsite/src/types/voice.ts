export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

