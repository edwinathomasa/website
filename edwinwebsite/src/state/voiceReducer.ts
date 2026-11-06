import type { VoiceAction, VoiceSessionStatus } from '../types/voice';

export const INITIAL_VOICE_SESSION: VoiceSessionStatus = {
  status: 'idle',
  error: null,
};

export function voiceSessionReducer(
  _state: VoiceSessionStatus,
  action: VoiceAction
): VoiceSessionStatus {
  switch (action.type) {
    case 'START_LISTENING':
      return { status: 'listening', interimTranscript: '' };
    case 'UPDATE_INTERIM':
      return { status: 'listening', interimTranscript: action.transcript };
    case 'START_THINKING':
      return { status: 'thinking', query: action.query };
    case 'START_SPEAKING':
      return { status: 'speaking', responseText: action.responseText };
    case 'STOP_TO_IDLE':
      return { status: 'idle', error: null };
    case 'SET_ERROR':
      return { status: 'idle', error: action.error };
  }
}
