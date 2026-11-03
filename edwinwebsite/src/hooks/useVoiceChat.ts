import { useEffect, useRef, useState } from 'react';
import { API_CONFIG, UI_LABELS } from '../constants/config';
import profile from '../data/profile';
import type { ChatTurn, VoiceState } from '../types/voice';
import {
  askProfileAssistant,
  speakWithElevenLabs,
  stopActiveSpeech,
  unlockAudioPlayback,
} from '../services/voiceAssistant';
import {
  getSpeechRecognitionConstructor,
  requestMicrophonePermission,
  type SpeechRecognitionLike,
} from '../services/audio/speechRecognition';

export function useVoiceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      text: `Hi! I'm ${profile.name}'s AI voice twin. Ask me anything about my experience, BLE & mobile skills, or projects!`,
    },
  ]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesRef = useRef<ChatTurn[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopActiveSpeech();
    };
  }, []);

  const stopAll = () => {
    recognitionRef.current?.abort();
    stopActiveSpeech();
    setInterimTranscript('');
    setVoiceState('idle');
  };

  const askQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    unlockAudioPlayback();
    stopAll();
    setErrorMessage(null);

    const historySnapshot = messagesRef.current;
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setVoiceState('thinking');

    try {
      const answer = await askProfileAssistant(trimmed, historySnapshot);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);

      await speakWithElevenLabs(
        answer,
        () => setVoiceState('speaking'),
        () => setVoiceState('idle')
      );
    } catch (err) {
      console.error('Voice assistant error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : UI_LABELS.VOICE.ERRORS.TTS_FAILED
      );
      setVoiceState('idle');
    }
  };

  const startListening = async () => {
    stopActiveSpeech();
    setErrorMessage(null);

    const hasMic = await requestMicrophonePermission();
    if (!hasMic) {
      setErrorMessage(UI_LABELS.VOICE.ERRORS.MIC_BLOCKED);
      setVoiceState('idle');
      return;
    }

    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      setErrorMessage(UI_LABELS.VOICE.ERRORS.UNSUPPORTED_BROWSER);
      setVoiceState('idle');
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
        setInterimTranscript(finalTranscript || interim);
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setErrorMessage(UI_LABELS.VOICE.ERRORS.MIC_DENIED);
        } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setVoiceState('idle');
      };

      recognition.onend = () => {
        const captured = finalTranscript.trim();
        if (captured) {
          void askQuestion(captured);
        } else {
          setInterimTranscript('');
          setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
        }
      };

      recognitionRef.current = recognition;
      setVoiceState('listening');
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage(UI_LABELS.VOICE.ERRORS.MIC_START_FAILED);
      setVoiceState('idle');
    }
  };

  const toggleVoiceAction = () => {
    unlockAudioPlayback();
    if (!isOpen) {
      setIsOpen(true);
      void startListening();
      return;
    }

    if (voiceState === 'listening' || voiceState === 'speaking') {
      stopAll();
    } else {
      void startListening();
    }
  };

  const closePanel = () => {
    stopAll();
    setIsOpen(false);
  };

  return {
    isOpen,
    voiceState,
    messages,
    interimTranscript,
    errorMessage,
    askQuestion,
    toggleVoiceAction,
    closePanel,
  };
}
