import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'avatar',
  exposes: {
    './Module': './src/remote-entry.ts',
    './VoiceRecognitionExtra':
      './src/app/exposed_modules/VoiceRecognitionExtra.tsx',
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
