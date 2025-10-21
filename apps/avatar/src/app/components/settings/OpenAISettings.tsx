import React, { ChangeEvent } from 'react';
import { useConfig } from '../../context';

export const OpenAISettings: React.FC = () => {
  const { openAIConfig, setOpenAIConfig } = useConfig();

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;

    setOpenAIConfig((prevConfig) => ({
      ...prevConfig,
      [id]: value,
    }));
  };

  return (
    <section className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold">Azure OpenAI Resource</h2>
      <label className="block text-sm mb-2" htmlFor="endpoint">
        Endpoint:
      </label>
      <input
        id="endpoint"
        type="text"
        value={openAIConfig.endpoint}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <label className="block text-sm mt-4 mb-2" htmlFor="apiKey">
        API Key:
      </label>
      <input
        id="apiKey"
        type="password"
        value={openAIConfig.apiKey}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <label className="block text-sm mt-4 mb-2" htmlFor="deploymentName">
        Deployment Name:
      </label>
      <input
        id="deploymentName"
        type="text"
        value={openAIConfig.deploymentName}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      />
      <label className="block text-sm mt-4 mb-2" htmlFor="systemPrompt">
        System Prompt:
      </label>
      <textarea
        id="systemPrompt"
        value={openAIConfig.systemPrompt}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded h-20"
      />
    </section>
  );
};
