import { formatPeriodsInText } from '@portfolio/shared';
import { getBackendEnv } from '../config/env.js';

export interface TtsSynthesisResult {
  readonly audioBuffer: Buffer;
  readonly contentType: string;
}

export async function synthesizeSpeech(
  text: string
): Promise<TtsSynthesisResult> {
  const { elevenLabsApiKey, elevenLabsVoiceId } = getBackendEnv();

  if (!elevenLabsApiKey || !elevenLabsVoiceId) {
    throw new Error('ElevenLabs credentials are not configured on the server.');
  }

  const spokenText = formatPeriodsInText(text.trim());
  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      elevenLabsVoiceId
    )}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: spokenText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    throw new Error(errText || `ElevenLabs HTTP ${upstream.status}`);
  }

  const arrayBuffer = await upstream.arrayBuffer();
  return {
    audioBuffer: Buffer.from(arrayBuffer),
    contentType: 'audio/mpeg',
  };
}
