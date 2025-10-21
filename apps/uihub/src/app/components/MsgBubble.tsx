import PayoBotImage from '../../assets/payo-bot.png';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { Message } from '../context/AppContext';
import { msgBubbleTime } from '@frontai/api-library';

export const MsgBubble = ({ msg }: { msg: Message }) => {
  const { sender, text, timestamp } = msg;

  return (
    <>
      <div
        className={`mb-4 flex ${
          sender === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        {sender === 'bot' && (
          <img
            src={PayoBotImage}
            alt="Payo Bot"
            className="inline-block mr-2 w-10 h-10 mt-6"
          />
        )}
        <div
          className={`flex flex-col ${
            sender === 'user' ? 'items-end' : 'items-start'
          }`}
        >
          <span className="text-sm text-gray-500 mt-1">
            {(sender === 'bot' && <>AI Assistant</>) || <>You</>}{' '}
            {msgBubbleTime(timestamp)}
          </span>
          <div
            className={`max-w-[100%] rounded-2xl px-4 py-2 ${
              sender === 'user'
                ? 'bg-[#8247E5] text-white'
                : 'bg-[#F7F3FF] text-gray-800'
            }`}
          >
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-500 hover:underline" />
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};
