import React, { ChangeEvent } from 'react';
import { useConfig } from '../../context';

export const SpeechSettings: React.FC = () => {
  const { sttTtsConfig, setSttTtsConfig } = useConfig();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = event.target;

    setSttTtsConfig((prevConfig) => ({
      ...prevConfig,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <section className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold">Speech Settings</h2>

      <label className="block text-sm mb-2" htmlFor="sttLocales">
        STT Locale(s):
      </label>
      <input
        id="sttLocales"
        type="text"
        size={64}
        value={sttTtsConfig.locales}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <label className="block text-sm mt-4 mb-2" htmlFor="ttsVoice">
        TTS Voice:
      </label>
      <input
        id="ttsVoice"
        type="text"
        size={32}
        value={sttTtsConfig.ttsVoice}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <label
        className="block text-sm mt-4 mb-2"
        htmlFor="customVoiceEndpointId"
      >
        Custom Voice Deployment ID (Endpoint ID):
      </label>
      <input
        id="customVoiceEndpointId"
        type="text"
        size={32}
        value={sttTtsConfig.customVoiceEndpointId}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <label
        className="block text-sm mt-4 mb-2"
        htmlFor="personalVoiceSpeakerProfileID"
      >
        Personal Voice Speaker Profile ID:
      </label>
      <input
        id="personalVoiceSpeakerProfileID"
        type="text"
        size={32}
        value={sttTtsConfig.personalVoiceSpeakerProfileID}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            id="continuousConversation"
            checked={sttTtsConfig.continuousConversation}
            onChange={handleInputChange}
            className="mr-2"
          />
          Continuous Conversation
        </label>
      </div>
    </section>
  );
};
