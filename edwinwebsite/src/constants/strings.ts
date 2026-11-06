import type { VoiceState } from '../types/voice';

export const STRINGS = {
  common: {
    listSeparator: ', ',
  },
  sections: {
    skills: 'Technical Skills',
    experience: 'Career Highlights',
    education: 'Education',
    projects: 'Projects',
  },
  profile: {
    avatarAlt: (name: string) => `${name}'s profile`,
    emailLabel: 'Email:',
    locationLabel: 'Location:',
  },
  experience: {
    roleHeading: (role: string, company: string, location?: string) =>
      `${role} — ${company}${location ? ` | ${location}` : ''}`,
    toolsLabel: 'Tools & Tech:',
  },
  education: {
    periodBadge: (period: string) => `(${period})`,
  },
  projects: {
    viewProject: 'View Project',
  },
  footer: {
    contactLabel: 'Contact:',
    locationLabel: 'Location:',
  },
  aria: {
    githubProfile: 'GitHub Profile',
    linkedinProfile: 'LinkedIn Profile',
    voiceButton: 'Talk to AI voice assistant',
    voiceDialog: 'AI Voice Assistant',
    closeVoice: 'Close voice chat',
    sendQuestion: 'Send question',
  },
  voice: {
    welcomeMessage: (name: string) =>
      `Hi! I'm ${name}'s AI voice twin. Ask me anything about my experience, BLE & mobile skills, or projects!`,
    interimTranscript: (transcript: string) => `${transcript}...`,
    inputPlaceholder: 'Or type a question...',
    quickPrompts: [
      'Tell me about yourself',
      'How many companies have you worked in?',
      'What is your BLE experience?',
      'Tell me about your current role',
    ],
    status: {
      idle: 'Edwin Voice AI',
      listening: 'Listening... Speak now',
      thinking: 'Thinking...',
      speaking: 'Edwin AI is speaking...',
    } satisfies Record<VoiceState, string>,
    button: {
      idle: 'Ask Edwin AI',
      listening: 'listening...',
      thinking: 'thinking...',
      speaking: 'stop',
    } satisfies Record<VoiceState, string>,
  },
  errors: {
    ttsFailed: 'Could not play ElevenLabs voice response.',
    micBlocked:
      'Microphone access blocked. Allow Microphone in your browser address bar or macOS System Settings.',
    micDenied:
      'Microphone access was denied. Please allow mic permissions or type below.',
    micStartFailed: 'Unable to start microphone.',
    unsupportedBrowser:
      'Voice recognition is not supported in this browser (use Chrome, Edge, or Safari). You can also type below!',
    speechRecognitionError: (error: string) =>
      `Speech recognition error: ${error}`,
    audioPlaybackFailed: 'Audio element failed to play MP3 stream.',
    httpStatus: (status: number) => `HTTP ${status}`,
  },
} as const;

export type Strings = typeof STRINGS;
export type StringDomain = keyof Strings;
