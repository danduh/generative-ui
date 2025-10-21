import { flushSync } from 'react-dom';

export function makeTransition(transition: () => void) {
  if (document.startViewTransition) {
    document.startViewTransition(flushSync.bind(null, transition));
  } else {
    transition();
  }
}
