import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { API_CONFIG } from '../constants/config';
import { STRINGS } from '../constants/strings';
import { askProfileAssistant } from '../services/ai/geminiService';
import {
  speakWithElevenLabs,
  stopActiveSpeech,
  unlockAudioPlayback,
} from '../services/audio/elevenLabsTts';
import {
  getSpeechRecognitionConstructor,
  requestMicrophonePermission,
  type SpeechRecognitionLike,
} from '../services/audio/speechRecognition';
import { usePortfolioState } from '../state/PortfolioContext';
import { INITIAL_VOICE_SESSION, voiceSessionReducer } from '../state/voiceReducer';
import type { ChatTurn, VoiceSessionStatus } from '../types/voice';

function createTurnId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseVoiceChatResult {
  readonly isOpen: boolean;
  readonly session: VoiceSessionStatus;
  readonly messages: readonly ChatTurn[];
  readonly askQuestion: (questionText: string) => Promise<void>;
  readonly toggleVoiceAction: () => void;
  readonly closePanel: () => void;
}

export function useVoiceChat(): UseVoiceChatResult {
  const profile = usePortfolioState();
  const [isOpen, setIsOpen] = useState(false);
  const [session, dispatch] = useReducer(voiceSessionReducer, INITIAL_VOICE_SESSION);
  const [messages, setMessages] = useState<readonly ChatTurn[]>(() => [
    {
      id: 'welcome-turn',
      role: 'assistant',
      text: STRINGS.voice.welcomeMessage(profile.name),
    },
  ]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesRef = useRef<readonly ChatTurn[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopActiveSpeech();
    };
  }, []);

  const stopAll = useCallback(() => {
    recognitionRef.current?.abort();
    stopActiveSpeech();
    dispatch({ type: 'STOP_TO_IDLE' });
  }, []);

  const askQuestion = useCallback(
    async (questionText: string) => {
      const trimmed = questionText.trim();
      if (!trimmed) return;

      unlockAudioPlayback();
      recognitionRef.current?.abort();
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
    },
    []
  );

  const startListening = useCallback(async () => {
    stopActiveSpeech();

    const hasMic = await requestMicrophonePermission();
    if (!hasMic) {
      dispatch({ type: 'SET_ERROR', error: STRINGS.errors.micBlocked });
      return;
    }

    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      dispatch({ type: 'SET_ERROR', error: STRINGS.errors.unsupportedBrowser });
      return;
    }

    try {
      recognitionRef.current?.abort();
      const recognition = new RecognitionCtor();
      recognition.lang = API_CONFIG.SPEECH_RECOGNITION_LANG;
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        dispatch({
          type: 'UPDATE_INTERIM',
          transcript: finalTranscript || interim,
        });
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          dispatch({ type: 'SET_ERROR', error: STRINGS.errors.micDenied });
        } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
          dispatch({
            type: 'SET_ERROR',
            error: STRINGS.errors.speechRecognitionError(event.error),
          });
        } else {
          dispatch({ type: 'STOP_TO_IDLE' });
        }
      };

      recognition.onend = () => {
        const captured = finalTranscript.trim();
        if (captured) {
          void askQuestion(captured);
        } else {
          dispatch({ type: 'STOP_TO_IDLE' });
        }
      };

      recognitionRef.current = recognition;
      dispatch({ type: 'START_LISTENING' });
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      dispatch({ type: 'SET_ERROR', error: STRINGS.errors.micStartFailed });
    }
  }, [askQuestion]);

  const toggleVoiceAction = useCallback(() => {
    unlockAudioPlayback();
    if (!isOpen) {
      setIsOpen(true);
      void startListening();
      return;
    }

    if (session.status === 'listening' || session.status === 'speaking') {
      stopAll();
    } else {
      void startListening();
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
