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
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={message}
            onChange={onChange}
            className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
            placeholder="Ask me anything..."
          />
          <div className="flex absolute inset-y-0 right-0 items-center pr-2">
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <SpeechRecognitionComponent
              setNextTextToSpeak={handleSpeechDone}
              setSpeakingText={setMessage}
            />
            <button onClick={onSubmit}
              type="submit"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Send className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
