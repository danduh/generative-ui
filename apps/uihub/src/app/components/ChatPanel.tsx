import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { chat } from '../services/api-client';
import { MsgBubble } from './MsgBubble';
import MessageForm from './MessageForm';

interface ChatPanelProps {
  initMessage: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  initMessage,
}: ChatPanelProps) => {
  const [message, setMessage] = useState<string>(initMessage);
  const { chatHistory, addMessage, setCanvasInstructions, toggleLoading } =
    useContext(AppContext);

  const handleSubmit = async (e?: React.FormEvent) => {
    setCanvasInstructions({
      intent: { component: '', intentName: '', parameters: {} },
      done: false,
    });
    if (message.trim()) {
      addMessage({
        text: message,
        sender: 'user',
        timestamp: Date.now(),
      });
      setMessage('');
      toggleLoading(true);
      await chat(message, { setCanvasInstructions, addMessage });
    }
  };

  useEffect(() => {
    if (initMessage.length > 0) {
      console.log(initMessage);
      initMessage = ''
      handleSubmit();
    }
  }, [initMessage]);

  const handleSpeechDone = async (text: string) => {
    setCanvasInstructions({
      intent: { component: '', intentName: '', parameters: {} },
      done: false,
    });
    if (text.trim()) {
      addMessage({
        text: text,
        sender: 'user',
        timestamp: Date.now(),
      });
      setMessage('');
      toggleLoading(true);
      await chat(text, { setCanvasInstructions, addMessage });
    }
  };

  React.useEffect(() => {
    const chatContainer = document.querySelector('.flex-grow.overflow-auto');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4">
        {chatHistory.map((msg, index) => (
          <MsgBubble key={index} msg={msg} />
        ))}
      </div>
      <div className="m-auto text-base w-full ">
        <MessageForm
          message={message}
          onChange={(e) => setMessage(e.target.value)}
          onSubmit={handleSubmit}
          setMessage={setMessage}
          handleSpeechDone={handleSpeechDone}
        />
        <div className="relative w-full px-2 py-2 text-center text-xs text-token-text-secondary empty:hidden md:px-[60px]">
          <div className="min-h-4">
            <div className="text-token-text-tertiary">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-token-secondary mb-1 mr-1 inline-block h-4 w-4 stroke-0"
              >
                <path
                  d="M18.0322 5.02393C17.7488 5.00078 17.3766 5 16.8 5H11.5002C11.3 6 11.0989 6.91141 10.8903 7.85409C10.7588 8.44955 10.6432 8.97304 10.3675 9.41399C10.1262 9.80009 9.80009 10.1262 9.41399 10.3675C8.97304 10.6432 8.44955 10.7588 7.85409 10.8903C7.81276 10.8994 7.77108 10.9086 7.72906 10.9179L5.21693 11.4762C5.1442 11.4924 5.07155 11.5001 5 11.5002V16.8C5 17.3766 5.00078 17.7488 5.02393 18.0322C5.04612 18.3038 5.0838 18.4045 5.109 18.454C5.20487 18.6422 5.35785 18.7951 5.54601 18.891C5.59546 18.9162 5.69617 18.9539 5.96784 18.9761C6.25118 18.9992 6.62345 19 7.2 19H10C10.5523 19 11 19.4477 11 20C11 20.5523 10.5523 21 10 21H7.16144C6.6343 21 6.17954 21 5.80497 20.9694C5.40963 20.9371 5.01641 20.8658 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3.13419 18.9836 3.06287 18.5904 3.03057 18.195C2.99997 17.8205 2.99998 17.3657 3 16.8385L3 11C3 8.92477 4.02755 6.93324 5.4804 5.4804C6.93324 4.02755 8.92477 3 11 3L16.8385 3C17.3657 2.99998 17.8205 2.99997 18.195 3.03057C18.5904 3.06287 18.9836 3.13419 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C20.8658 5.01641 20.9371 5.40963 20.9694 5.80497C21 6.17954 21 6.6343 21 7.16144V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V7.2C19 6.62345 18.9992 6.25118 18.9761 5.96784C18.9539 5.69617 18.9162 5.59546 18.891 5.54601C18.7951 5.35785 18.6422 5.20487 18.454 5.109C18.4045 5.0838 18.3038 5.04612 18.0322 5.02393ZM5.28014 9.41336L7.2952 8.96556C8.08861 8.78925 8.24308 8.74089 8.35381 8.67166C8.48251 8.59121 8.59121 8.48251 8.67166 8.35381C8.74089 8.24308 8.78925 8.08861 8.96556 7.2952L9.41336 5.28014C8.51014 5.59289 7.63524 6.15398 6.89461 6.89461C6.15398 7.63524 5.59289 8.51014 5.28014 9.41336ZM17 15C17 14.4477 17.4477 14 18 14C18.5523 14 19 14.4477 19 15V17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H19V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V19H15C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17H17V15Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span className="text-token-secondary font-semibold">
                New version of Payoneer CoPilot available
              </span>{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
