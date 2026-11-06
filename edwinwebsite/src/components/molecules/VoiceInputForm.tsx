import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { ICON_SIZES, UI_LABELS } from '../../constants/config';
import IconButton from '../atoms/IconButton';

interface VoiceInputFormProps {
  disabled: boolean;
  onSubmitQuestion: (question: string) => void;
}

function VoiceInputForm({ disabled, onSubmitQuestion }: VoiceInputFormProps) {
  const [textInput, setTextInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || disabled) return;
    onSubmitQuestion(textInput);
    setTextInput('');
  };

  return (
    <form className="ai-voice-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        className="ai-voice-input"
        placeholder={UI_LABELS.VOICE.INPUT_PLACEHOLDER}
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        disabled={disabled}
      />
      <IconButton
        type="submit"
        className="ai-voice-send"
        disabled={!textInput.trim() || disabled}
        ariaLabel={UI_LABELS.ARIA.SEND_QUESTION}
      >
        <FaPaperPlane size={ICON_SIZES.XS} />
      </IconButton>
    </form>
  );
}

export default VoiceInputForm;
