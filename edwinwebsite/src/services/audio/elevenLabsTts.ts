import { API_CONFIG, ENV } from '../../constants/config';
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

async function fetchElevenLabsAudioBlob(
  text: string,
  apiKey: string,
  voiceId: string
): Promise<Blob> {
  const response = await fetch(
    `${API_CONFIG.ELEVENLABS_BASE_URL}/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: API_CONFIG.ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: API_CONFIG.ELEVENLABS_STABILITY,
          similarity_boost: API_CONFIG.ELEVENLABS_SIMILARITY_BOOST,
        },
      }),
    }
  );

  if (!response.ok) {
    let detailMessage: string = STRINGS.errors.httpStatus(response.status);
    try {
      const errJson = (await response.json()) as {
        detail?: { message?: string; status?: string } | string;
      };
      if (typeof errJson?.detail === 'string') {
        detailMessage = errJson.detail;
      } else if (errJson?.detail?.message) {
        detailMessage = errJson.detail.message;
      }
    } catch {
      const errText = await response.text().catch(() => '');
      if (errText) detailMessage = errText;
    }
    throw new Error(detailMessage);
  }

  return response.blob();
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
  const blob = await fetchElevenLabsAudioBlob(
    spokenText,
    ENV.ELEVENLABS_API_KEY,
    ENV.ELEVENLABS_VOICE_ID
  );
  await playBlobOnSharedAudio(blob, onStart, onEnd);
}
