import React, { ChangeEvent, useState } from 'react';
import { SpeechResourceConfig, useConfig } from '../../context';

export const SpeechResSettings: React.FC = () => {
  const { speechConfig, setSpeechConfig } = useConfig();

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type, checked } = event.target as HTMLInputElement;

    setSpeechConfig((prevConfig: SpeechResourceConfig) => ({
      ...prevConfig,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <section className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold">Azure Speech Resource</h2>
      <label className="block text-sm mb-2" htmlFor="region">
        Region:
      </label>
      <select
        id="region"
        value={speechConfig.region}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded"
      >
        <option value="westus2">West US 2</option>
        <option value="westeurope">West Europe</option>
        <option value="southeastasia">Southeast Asia</option>
        <option value="southcentralus">South Central US</option>
        <option value="northeurope">North Europe</option>
        <option value="swedencentral">Sweden Central</option>
        <option value="eastus2">East US 2</option>
      </select>
      <label className="block text-sm mt-4 mb-2" htmlFor="apiKey">
        API Key:
      </label>
      <input
        id="apiKey"
        type="password"
        value={speechConfig.apiKey}
        onChange={handleInputChange}
        className="block w-full p-1 border rounded text-sm"
      />
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            id="enablePrivateEndpoint"
            checked={speechConfig.enablePrivateEndpoint}
            onChange={handleInputChange}
            className="mr-2"
          />
          Enable Private Endpoint
        </label>
      </div>
      {speechConfig.enablePrivateEndpoint && (
        <div className="mt-4">
          <label className="block text-sm mb-2" htmlFor="privateEndpoint">
            Private Endpoint:
          </label>
          <input
            id="privateEndpoint"
            type="text"
            value={speechConfig.privateEndpoint}
            onChange={handleInputChange}
            placeholder="https://{your custom name}.cognitiveservices.azure.com/"
            className="block w-full p-1 border rounded"
          />
        </div>
      )}
    </section>
  );
};
