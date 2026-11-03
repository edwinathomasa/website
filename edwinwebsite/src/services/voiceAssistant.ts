export type { ChatTurn, VoiceState } from '../types/voice';
export { askProfileAssistant } from './ai/geminiService';
export {
  speakWithElevenLabs,
  stopActiveSpeech,
  unlockAudioPlayback,
} from './audio/elevenLabsTts';
