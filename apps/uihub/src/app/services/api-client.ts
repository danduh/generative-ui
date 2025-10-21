import {
  ChatSessionProvider,
  Message,
} from '../context/AppContext';
import { ResponseDto } from '@frontai/api-library';
import { CanvasInstructions } from '../types';

export const chat = async (
  query: string,
  { setCanvasInstructions, addMessage }: any
) => {
  if (!ChatSessionProvider.chatSession)
    ChatSessionProvider.setChatSession(crypto.randomUUID());
  const sessionId = ChatSessionProvider.chatSession;

  const response = await fetch(
    `http://localhost:3000/api/azureai/${sessionId}/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get response from API');
  }

  const data: ResponseDto = await response.json().then((data) => data);
  const botMessage: Message = {
    id: crypto.randomUUID(),
    text: data.description,
    sender: 'bot',
    timestamp: Date.now()
  };
  const instructions: CanvasInstructions = {
    intent: data.intent,
    done: false,
    context: data.context,
    description: data.description
  };

  setCanvasInstructions(instructions);
  addMessage(botMessage);

  return { botMessage, instructions };
};
