import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useReducer,
} from 'react';
import { CanvasInstructions } from '../types';
import { AppState, chatApiReducer } from '../reducer';

export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode?: () => void;
  apiUsage: number;
  chatHistory: Message[];
  addMessage: (message: Message) => void;
  latestAssistant?: Message;
  setCanvasInstructions: (instructions: CanvasInstructions) => void;
  canvasInstructions?: CanvasInstructions;
  dispatch?: any;
  state?: AppState;
  loading?: boolean;
  toggleLoading: (loading: boolean) => void;
}

const InitContext: Partial<AppContextType> = {
  darkMode: false,
  apiUsage: 0,
  chatHistory: [],
  addMessage: (message: Message) => {
    // Implementation here
  },
  setCanvasInstructions: () => {
    // Implementation here
  },
};

export const AppContext = createContext<AppContextType>(InitContext as AppContextType);

interface AppProviderProps {
  children: ReactNode;
}

export const ChatSessionProvider: any = {};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [apiUsage, setApiUsage] = useState<number>(0);
  const [loading, toggleLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [latestAssistant, setLatestAssistant] = useState<Message>();
  const [chatSession, setChatSession] = useState<string>();
  const [canvasInstructions, setCanvasInstructions] =
    useState<CanvasInstructions>();

  ChatSessionProvider.chatSession = chatSession;
  ChatSessionProvider.setChatSession = setChatSession;

  const [state, dispatch] = useReducer(chatApiReducer, {});

  const toggleDarkMode = () => {
    // console.log(darkMode)
    setDarkMode(!darkMode);
  };
  const addMessage = (message: Message) => {
    if (message.sender === 'bot') setLatestAssistant(message);
    setChatHistory((prevMsgs) => [...prevMsgs, message]);
    setApiUsage(apiUsage + 1);
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        apiUsage,
        chatHistory,
        addMessage,
        latestAssistant,
        setCanvasInstructions,
        canvasInstructions,
        dispatch,
        state,
        loading,
        toggleLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
