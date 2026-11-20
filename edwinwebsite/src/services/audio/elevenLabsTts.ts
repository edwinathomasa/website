import { API_CONFIG, STATIC_FALLBACK_ENV } from '../../constants/config';
import { STRINGS } from '../../constants/strings';
import { formatPeriodsInText } from '../../utils/speechFormat';

// Tiny silent WAV data URI used to unlock HTMLAudioElement during a user click gesture
const SILENT_WAV_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let sharedAudioElement: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let isAudioUnlocked = false;

function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioElement) {
    sharedAudioElement = new Audio();
    sharedAudioElement.preload = 'auto';
  }
  return sharedAudioElement;
}

export function unlockAudioPlayback(): void {
  const audio = getSharedAudio();
  if (!audio || isAudioUnlocked) return;

  audio.src = SILENT_WAV_URI;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      isAudioUnlocked = true;
    })
    .catch(() => {
      // Ignore initial unlock error if already playing
    });
}

export function stopActiveSpeech(): void {
  if (sharedAudioElement) {
    sharedAudioElement.onended = null;
    sharedAudioElement.onerror = null;
    sharedAudioElement.onplay = null;
    sharedAudioElement.pause();
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

async function fetchDirectElevenLabsFallback(text: string): Promise<Blob | null> {
  const apiKey = (STATIC_FALLBACK_ENV.ELEVENLABS_API_KEY ?? '').trim();
  const voiceId = (STATIC_FALLBACK_ENV.ELEVENLABS_VOICE_ID ?? '').trim();
  if (!apiKey || !voiceId) return null;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      voiceId
    )}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || STRINGS.errors.httpStatus(res.status));
  }

  return res.blob();
}

async function fetchTtsAudioBlob(text: string): Promise<Blob> {
  try {
    const response = await fetch(API_CONFIG.TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('audio/')) {
      return response.blob();
    }

    // If /api/tts returned 404/405 or SPA text/html on AWS Amplify static hosting, try build-time static fallback
    const fallbackBlob = await fetchDirectElevenLabsFallback(text);
    if (fallbackBlob) {
      return fallbackBlob;
    }

    let detailMessage: string = STRINGS.errors.httpStatus(response.status);
    try {
      const errJson = (await response.json()) as {
        error?: string;
        detail?: { message?: string } | string;
      };
      if (typeof errJson?.error === 'string') {
        detailMessage = errJson.error;
      } else if (typeof errJson?.detail === 'string') {
        detailMessage = errJson.detail;
      } else if (errJson?.detail?.message) {
        detailMessage = errJson.detail.message;
      }
    } catch {
      const errText = await response.text().catch(() => '');
      if (errText) detailMessage = errText;
    }
    throw new Error(detailMessage);
  } catch (err) {
    const fallbackBlob = await fetchDirectElevenLabsFallback(text).catch(
      () => null
    );
    if (fallbackBlob) {
      return fallbackBlob;
    }
    throw err;
  }
}

async function playBlobOnSharedAudio(
  blob: Blob,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  const audio = getSharedAudio() ?? new Audio();
  const audioUrl = URL.createObjectURL(blob);
  currentObjectUrl = audioUrl;
  audio.src = audioUrl;

  await new Promise<void>((resolve, reject) => {
    audio.onplay = () => onStart?.();
    audio.onended = () => {
      if (currentObjectUrl === audioUrl) {
        URL.revokeObjectURL(audioUrl);
        currentObjectUrl = null;
      }
      onEnd?.();
      resolve();
    };
    audio.onerror = () => {
      if (currentObjectUrl === audioUrl) {
        URL.revokeObjectURL(audioUrl);
        currentObjectUrl = null;
      }
      onEnd?.();
      reject(new Error(STRINGS.errors.audioPlaybackFailed));
    };
    audio.play().catch((playErr) => {
      if (currentObjectUrl === audioUrl) {
        URL.revokeObjectURL(audioUrl);
        currentObjectUrl = null;
      }
      onEnd?.();
      reject(playErr);
    });
  });
}

export async function speakWithElevenLabs(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopActiveSpeech();

  const spokenText = formatPeriodsInText(text);
  const blob = await fetchTtsAudioBlob(spokenText);
  await playBlobOnSharedAudio(blob, onStart, onEnd);
}
