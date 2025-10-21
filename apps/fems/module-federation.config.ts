import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'fems',
  exposes: {
    './Module': './src/remote-entry.ts',
    './UsersTable': 'apps/fems/src/exposed_modules/UsersTable.tsx',
    './UserDetails': 'apps/fems/src/exposed_modules/UserDetails.tsx',
    './EditUserForm': 'apps/fems/src/exposed_modules/EditUserForm.tsx',
    './ContextDisplay': 'apps/fems/src/exposed_modules/ContextDisplay.tsx',
    // New
    './BalancesView': 'apps/fems/src/exposed_modules/BalancesView.tsx',
    './TransactionDetails': 'apps/fems/src/exposed_modules/TransactionDetails.tsx',
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
