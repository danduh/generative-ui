import React, { createContext, useContext, useState, ReactNode } from 'react';

export const SPEECH_RESOURCE_INIT = {
  region: 'eastus2',
  apiKey: process.env.REACT_APP_SPEACH_API_KEY || '',
  privateEndpoint: '',
  enablePrivateEndpoint: false,
};

export const STT_TTS_INIT = {
  locales: 'en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN',
  ttsVoice: 'en-US-AvaMultilingualNeural',
  customVoiceEndpointId: '',
  personalVoiceSpeakerProfileID: '',
  continuousConversation: false,
};

export const OPEN_AI_INIT = {
  endpoint: process.env.REACT_APP_OPENAI_END_POINT || '',
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  deploymentName: process.env.REACT_APP_OPENAI_DEPLOYMENT_ID || '',
  systemPrompt: 'You are an AI assistant that helps people find information.',
};

// Initial settings for Avatar Configuration
export const AVATAR_CONFIG_INIT: AvatarConfig = {
  character: 'lisa',
  style: 'casual-sitting',
  customized: false,
  autoReconnect: false,
  useLocalVideoForIdle: false,
};

export type SpeechResourceConfig = {
  region: string;
  apiKey: string;
  enablePrivateEndpoint: boolean;
  privateEndpoint: string;
};

export type OpenAIConfig = {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  systemPrompt: string;
};

export type SttTtsConfig = {
  locales: string;
  ttsVoice: string;
  customVoiceEndpointId: string;
  personalVoiceSpeakerProfileID: string;
  continuousConversation: boolean;
};

// Define a type for Avatar Configuration
export type AvatarConfig = {
  character: string;
  style: string;
  customized: boolean;
  autoReconnect: boolean;
  useLocalVideoForIdle: boolean;
};

type ConfigContextType = {
  speechConfig: SpeechResourceConfig;
  setSpeechConfig: React.Dispatch<React.SetStateAction<SpeechResourceConfig>>;
  openAIConfig: OpenAIConfig;
  setOpenAIConfig: React.Dispatch<React.SetStateAction<OpenAIConfig>>;
  sttTtsConfig: SttTtsConfig;
  setSttTtsConfig: React.Dispatch<React.SetStateAction<SttTtsConfig>>;
  avatarConfig: AvatarConfig;
  setAvatarConfig: React.Dispatch<React.SetStateAction<AvatarConfig>>;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [speechConfig, setSpeechConfig] =
    useState<SpeechResourceConfig>(SPEECH_RESOURCE_INIT);
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>(OPEN_AI_INIT);
  const [sttTtsConfig, setSttTtsConfig] = useState<SttTtsConfig>(STT_TTS_INIT);
  const [avatarConfig, setAvatarConfig] =
    useState<AvatarConfig>(AVATAR_CONFIG_INIT);

  return (
    <ConfigContext.Provider
      value={{
        speechConfig,
        setSpeechConfig,
        openAIConfig,
        setOpenAIConfig,
        sttTtsConfig,
        setSttTtsConfig,
        avatarConfig,
        setAvatarConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
