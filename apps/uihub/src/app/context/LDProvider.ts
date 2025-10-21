import { withLDProvider } from 'launchdarkly-react-client-sdk';
export const LDProvider = withLDProvider({
  clientSideID: 'client-side-id-123abc',
  context: {
    "kind": "user",
    "key": "user-key-123abc",
    "name": "Sandy Smith",
    "email": "sandy@example.com"
  },
  options: { /* ... */ }
})
