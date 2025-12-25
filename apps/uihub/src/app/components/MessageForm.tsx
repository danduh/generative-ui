import { Paperclip, Send } from 'lucide-react';
import SpeechRecognitionComponent from '../voicerecognizer/VoiceRecognizer';
import React from 'react';

const MessageForm: React.FC<{
  message: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setMessage: any;
  onSubmit: (e: React.FormEvent) => void;
  handleSpeechDone: any
}> = ({ message, onChange, onSubmit, setMessage , handleSpeechDone}) => {
  return (
    <div className="p-4">
      <div className="bg-white/90 border-2 border-[#da54d8] rounded-[24px] p-4 flex items-center gap-4">
        <div className="flex-grow flex items-center gap-4">
          <input
            type="text"
            value={message}
            onChange={onChange}
            className="w-full bg-transparent focus:outline-none text-[16px] leading-[22px] placeholder:text-[#878787]"
            placeholder="Ask me anything"
            style={{ fontFamily: 'Avenir Next World, sans-serif', fontWeight: 500 }}
          />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-6 h-6 text-[#252526]" />
          </button>
          <SpeechRecognitionComponent
            setNextTextToSpeak={handleSpeechDone}
            setSpeakingText={setMessage}
          />
          <button 
            onClick={onSubmit}
            type="submit"
            className="bg-[#d3d3d3] rounded-[24px] w-9 h-9 flex items-center justify-center hover:bg-[#c0c0c0] transition-colors disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
