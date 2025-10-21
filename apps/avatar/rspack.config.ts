import { composePlugins, withNx, withReact } from '@nx/rspack';
import { withModuleFederation } from '@nx/module-federation/rspack';

import baseConfig from './module-federation.config';
import * as rspack from '@rspack/core';

const config = {
  ...baseConfig,
};

// Nx plugins for rspack to build config object from Nx options and context.
/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
const envs = {};
Object.keys(process.env).reduce((_envs: any, key: string) => {
  if (key.startsWith('REACT_APP_'))
    _envs[`process.env.${key}`] = JSON.stringify(process.env[key]);
  return _envs;
}, envs);

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
  (config) => {
    config.plugins.push(new rspack.DefinePlugin(envs));
    return config;
  }
);
