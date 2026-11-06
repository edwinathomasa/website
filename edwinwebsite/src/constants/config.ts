import type { VoiceState } from '../types/voice';

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

export const UI_LABELS = {
  SECTIONS: {
    SKILLS: 'Technical Skills',
    EXPERIENCE: 'Career Highlights',
    EDUCATION: 'Education',
    PROJECTS: 'Projects',
  },
  PROFILE: {
    EMAIL_LABEL: 'Email:',
    LOCATION_LABEL: 'Location:',
    TOOLS_LABEL: 'Tools & Tech:',
    VIEW_PROJECT: 'View Project',
    CONTACT_LABEL: 'Contact:',
  },
  ARIA: {
    GITHUB: 'GitHub Profile',
    LINKEDIN: 'LinkedIn Profile',
    VOICE_BUTTON: 'Talk to AI voice assistant',
    VOICE_DIALOG: 'AI Voice Assistant',
    CLOSE_VOICE: 'Close voice chat',
    SEND_QUESTION: 'Send question',
  },
  VOICE: {
    INPUT_PLACEHOLDER: 'Or type a question...',
    QUICK_PROMPTS: [
      'Tell me about yourself',
      'How many companies have you worked in?',
      'What is your BLE experience?',
      'Tell me about your current role',
    ],
    STATUS: {
      idle: 'Edwin Voice AI',
      listening: 'Listening... Speak now',
      thinking: 'Thinking...',
      speaking: 'Edwin AI is speaking...',
    } satisfies Record<VoiceState, string>,
    BUTTON: {
      idle: 'Ask Edwin AI',
      listening: 'listening...',
      thinking: 'thinking...',
      speaking: 'stop',
    } satisfies Record<VoiceState, string>,
    ERRORS: {
      TTS_FAILED: 'Could not play ElevenLabs voice response.',
      MIC_BLOCKED:
        'Microphone access blocked. Allow Microphone in your browser address bar or macOS System Settings.',
      MIC_DENIED:
        'Microphone access was denied. Please allow mic permissions or type below.',
      MIC_START_FAILED: 'Unable to start microphone.',
      UNSUPPORTED_BROWSER:
        'Voice recognition is not supported in this browser (use Chrome, Edge, or Safari). You can also type below!',
    },
  },
} as const;
