import type { VoiceState } from '@portfolio/shared';

export const STRINGS = {
  sections: {
    skills: 'Technical Skills',
    experience: 'Career Highlights',
    education: 'Education',
    projects: 'Projects',
  },
  profile: {
    avatarAlt: (name: string) => `${name}'s profile`,
  },
  experience: {
    toolsLabel: 'Tools & Tech:',
  },
  projects: {
    viewProject: 'View Project',
  },
  aria: {
    githubProfile: 'GitHub Profile',
    linkedinProfile: 'LinkedIn Profile',
    voiceButton: 'Talk to AI voice assistant',
  },
  voice: {
    welcomeMessage: (name: string) =>
      `Hi! I'm ${name} AI voice twin. Ask me anything about my professional experience, skills, or projects!`,
    interimTranscript: (transcript: string) => `${transcript}...`,
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
      'Microphone access was denied. Please allow mic permissions.',
    unsupportedBrowser:
      'Voice recognition is not supported in this browser (use Chrome, Edge, or Safari).',
    speechRecognitionError: (error: string) =>
      `Speech recognition error: ${error}`,
    audioPlaybackFailed: 'Audio element failed to play MP3 stream.',
    httpStatus: (status: number) => `HTTP ${status}`,
  },
} as const;
