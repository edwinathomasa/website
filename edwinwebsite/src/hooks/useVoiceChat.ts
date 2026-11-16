import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { API_CONFIG } from '../constants/config';
import { STRINGS } from '../constants/strings';
import {
  askProfileAssistant,
  transcribeAudioBlob,
} from '../services/ai/geminiService';
import {
  speakWithElevenLabs,
  stopActiveSpeech,
  unlockAudioPlayback,
} from '../services/audio/elevenLabsTts';
import {
  getSpeechRecognitionConstructor,
  type SpeechRecognitionLike,
} from '../services/audio/speechRecognition';
import { usePortfolioState } from '../state/PortfolioContext';
import {
  INITIAL_VOICE_SESSION,
  voiceSessionReducer,
} from '../state/voiceReducer';
import type { ChatTurn, VoiceSessionStatus } from '../types/voice';

function createTurnId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface ActiveMediaSession {
  stopAndSubmit: () => void;
  abort: () => void;
}

export interface UseVoiceChatOptions {
  readonly autoPlayWelcome?: boolean;
}

export interface UseVoiceChatResult {
  readonly isOpen: boolean;
  readonly session: VoiceSessionStatus;
  readonly messages: readonly ChatTurn[];
  readonly askQuestion: (questionText: string) => Promise<void>;
  readonly toggleVoiceAction: () => void;
  readonly closePanel: () => void;
}

export function useVoiceChat(
  options?: UseVoiceChatOptions
): UseVoiceChatResult {
  const isAiRoute =
    typeof window !== 'undefined' &&
    (window.location.hash === '#/ai' || window.location.pathname === '/ai');
  const shouldAutoPlayWelcome = options?.autoPlayWelcome ?? isAiRoute;

  const profile = usePortfolioState();
  const [isOpen, setIsOpen] = useState(shouldAutoPlayWelcome);
  const [session, dispatch] = useReducer(
    voiceSessionReducer,
    INITIAL_VOICE_SESSION
  );
  const [messages, setMessages] = useState<readonly ChatTurn[]>(() => [
    {
      id: 'welcome-turn',
      role: 'assistant',
      text: STRINGS.voice.welcomeMessage(profile.name),
    },
  ]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaSessionRef = useRef<ActiveMediaSession | null>(null);
  const speechNetworkBlockedRef = useRef<boolean>(false);
  const messagesRef = useRef<readonly ChatTurn[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!shouldAutoPlayWelcome) return;
    let cancelled = false;
    const welcomeText = STRINGS.voice.welcomeMessage(profile.name);

    const playGreeting = () => {
      if (cancelled) return;
      void speakWithElevenLabs(
        welcomeText,
        () => {
          if (!cancelled) {
            dispatch({ type: 'START_SPEAKING', responseText: welcomeText });
          }
        },
        () => {
          if (!cancelled) {
            dispatch({ type: 'STOP_TO_IDLE' });
          }
        }
      ).catch((err) => {
        console.warn('Welcome audio autoplay deferred:', err);
      });
    };

    const timer = window.setTimeout(playGreeting, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [shouldAutoPlayWelcome, profile.name]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      mediaSessionRef.current?.abort();
      stopActiveSpeech();
    };
  }, []);

  const stopAll = useCallback(() => {
    const activeRec = recognitionRef.current;
    recognitionRef.current = null;
    activeRec?.abort();

    const activeMedia = mediaSessionRef.current;
    mediaSessionRef.current = null;
    activeMedia?.abort();

    stopActiveSpeech();
    dispatch({ type: 'STOP_TO_IDLE' });
  }, []);

  const askQuestion = useCallback(async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    unlockAudioPlayback();
    const activeRec = recognitionRef.current;
    recognitionRef.current = null;
    activeRec?.abort();

    const activeMedia = mediaSessionRef.current;
    mediaSessionRef.current = null;
    activeMedia?.abort();

    stopActiveSpeech();

    const historySnapshot = messagesRef.current;
    setMessages((prev) => [
      ...prev,
      { id: createTurnId(), role: 'user', text: trimmed },
    ]);
    dispatch({ type: 'START_THINKING', query: trimmed });

    try {
      const answer = await askProfileAssistant(trimmed, historySnapshot);
      setMessages((prev) => [
        ...prev,
        { id: createTurnId(), role: 'assistant', text: answer },
      ]);

      await speakWithElevenLabs(
        answer,
        () => dispatch({ type: 'START_SPEAKING', responseText: answer }),
        () => dispatch({ type: 'STOP_TO_IDLE' })
      );
    } catch (err) {
      console.error('Voice assistant error:', err);
      dispatch({
        type: 'SET_ERROR',
        error: err instanceof Error ? err.message : STRINGS.errors.ttsFailed,
      });
    }
  }, []);

  /**
   * Universal MediaRecorder + WebAudio silence detector fallback.
   * Used automatically when the browser's SpeechRecognition throws a `network` error.
   */
  const startMediaRecorderListening = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      dispatch({
        type: 'SET_ERROR',
        error: STRINGS.errors.unsupportedBrowser,
      });
      return;
    }

    try {
      mediaSessionRef.current?.abort();
      dispatch({ type: 'START_LISTENING' });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];
      let isAborted = false;
      let isStopped = false;
      let rafId = 0;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const mimeType =
        preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      let audioCtx: AudioContext | null = null;
      try {
        const AudioCtxCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtxCtor) {
          audioCtx = new AudioCtxCtor();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);

          const data = new Uint8Array(analyser.fftSize);
          let hasSpoken = false;
          let silenceStart = 0;
          const recordStart = performance.now();

          const checkVolume = (now: number) => {
            if (isStopped || isAborted) return;
            analyser.getByteTimeDomainData(data);
            let sumSq = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sumSq += v * v;
            }
            const rms = Math.sqrt(sumSq / data.length);

            if (rms > 0.028) {
              if (!hasSpoken) {
                hasSpoken = true;
                dispatch({
                  type: 'UPDATE_INTERIM',
                  transcript: 'Listening to your voice',
                });
              }
              silenceStart = 0;
            } else if (hasSpoken) {
              if (silenceStart === 0) {
                silenceStart = now;
              } else if (now - silenceStart > 1400) {
                // 1.4 seconds of silence after speaking -> auto-submit
                stopAndSubmit();
                return;
              }
            }

            // Safety cap at 12 seconds of recording
            if (now - recordStart > 12000) {
              stopAndSubmit();
              return;
            }

            rafId = window.requestAnimationFrame(checkVolume);
          };

          rafId = window.requestAnimationFrame(checkVolume);
        }
      } catch {
        // If AudioContext analysis isn't available, user can tap orb to finish
      }

      const cleanupMedia = () => {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        stream.getTracks().forEach((track) => track.stop());
        if (audioCtx && audioCtx.state !== 'closed') {
          void audioCtx.close().catch(() => {});
        }
      };

      const stopAndSubmit = () => {
        if (isStopped) return;
        isStopped = true;
        if (recorder.state !== 'inactive') {
          recorder.stop();
        } else {
          cleanupMedia();
        }
      };

      const abort = () => {
        isAborted = true;
        isStopped = true;
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        cleanupMedia();
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (mediaSessionRef.current?.stopAndSubmit === stopAndSubmit) {
          mediaSessionRef.current = null;
        }
        cleanupMedia();
        if (isAborted) return;

        const blob = new Blob(chunks, {
          type: recorder.mimeType || 'audio/webm',
        });
        if (blob.size < 400) {
          dispatch({ type: 'STOP_TO_IDLE' });
          return;
        }

        dispatch({
          type: 'UPDATE_INTERIM',
          transcript: 'Processing speech',
        });

        const transcript = await transcribeAudioBlob(blob);
        if (transcript.trim()) {
          void askQuestion(transcript.trim());
        } else {
          dispatch({
            type: 'SET_ERROR',
            error:
              'Could not hear a clear question. Tap the orb and speak clearly.',
          });
        }
      };

      mediaSessionRef.current = { stopAndSubmit, abort };
      recorder.start();
    } catch (err) {
      console.error('Microphone capture error:', err);
      dispatch({ type: 'SET_ERROR', error: STRINGS.errors.micDenied });
    }
  }, [askQuestion]);

  const startListening = useCallback(() => {
    stopActiveSpeech();

    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor || speechNetworkBlockedRef.current) {
      void startMediaRecorderListening();
      return;
    }

    try {
      const prevRec = recognitionRef.current;
      recognitionRef.current = null;
      prevRec?.abort();

      const recognition = new RecognitionCtor();
      recognition.lang = API_CONFIG.SPEECH_RECOGNITION_LANG;
      recognition.interimResults = true;
      recognition.continuous = false;

      let capturedTranscript = '';
      let hadFatalError = false;

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const chunk = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalTranscript += chunk;
          } else {
            interimTranscript += chunk;
          }
        }
        capturedTranscript = `${finalTranscript} ${interimTranscript}`.trim();
        dispatch({
          type: 'UPDATE_INTERIM',
          transcript: capturedTranscript,
        });
      };

      recognition.onerror = (event) => {
        if (event.error === 'network') {
          // Browser's native speech server is unreachable/blocked; seamlessly switch to MediaRecorder STT
          hadFatalError = true;
          speechNetworkBlockedRef.current = true;
          recognitionRef.current = null;
          void startMediaRecorderListening();
          return;
        }

        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed'
        ) {
          hadFatalError = true;
          dispatch({ type: 'SET_ERROR', error: STRINGS.errors.micDenied });
        } else if (event.error === 'audio-capture') {
          hadFatalError = true;
          dispatch({ type: 'SET_ERROR', error: STRINGS.errors.micBlocked });
        } else if (event.error === 'no-speech') {
          if (!capturedTranscript) {
            hadFatalError = true;
            dispatch({
              type: 'SET_ERROR',
              error:
                'No speech detected. Tap the orb and speak into your microphone.',
            });
          }
        } else if (event.error !== 'aborted') {
          hadFatalError = true;
          dispatch({
            type: 'SET_ERROR',
            error: STRINGS.errors.speechRecognitionError(event.error),
          });
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
        if (hadFatalError) return;

        const captured = capturedTranscript.trim();
        if (captured) {
          void askQuestion(captured);
        } else {
          dispatch({ type: 'STOP_TO_IDLE' });
        }
      };

      recognitionRef.current = recognition;
      dispatch({ type: 'START_LISTENING' });
      recognition.start();
    } catch {
      speechNetworkBlockedRef.current = true;
      void startMediaRecorderListening();
    }
  }, [askQuestion, startMediaRecorderListening]);

  const toggleVoiceAction = useCallback(() => {
    unlockAudioPlayback();
    if (!isOpen) {
      setIsOpen(true);
      startListening();
      return;
    }

    if (session.status === 'listening') {
      if (mediaSessionRef.current) {
        mediaSessionRef.current.stopAndSubmit();
      } else {
        recognitionRef.current?.stop();
      }
    } else if (session.status === 'speaking') {
      stopAll();
    } else {
      startListening();
    }
  }, [isOpen, session.status, startListening, stopAll]);

  const closePanel = useCallback(() => {
    stopAll();
    setIsOpen(false);
  }, [stopAll]);

  return {
    isOpen,
    session,
    messages,
    askQuestion,
    toggleVoiceAction,
    closePanel,
  };
}
