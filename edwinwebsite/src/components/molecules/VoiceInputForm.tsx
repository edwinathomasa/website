import { memo, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { ICON_SIZES } from '../../constants/config';
import { STRINGS } from '../../constants/strings';
import IconButton from '../atoms/IconButton';

interface VoiceInputFormProps {
  readonly disabled: boolean;
  readonly onSubmitQuestion: (question: string) => void;
}

const VoiceInputForm = memo(function VoiceInputForm({
  disabled,
  onSubmitQuestion,
}: VoiceInputFormProps) {
  // Colocated input draft state so keystrokes never re-render the chat log or parent panel
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
        placeholder={STRINGS.voice.inputPlaceholder}
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        disabled={disabled}
      />
      <IconButton
        type="submit"
        className="ai-voice-send"
        disabled={!textInput.trim() || disabled}
        ariaLabel={STRINGS.aria.sendQuestion}
      >
        <FaPaperPlane size={ICON_SIZES.XS} />
      </IconButton>
    </form>
  );
});

export default VoiceInputForm;
