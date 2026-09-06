import 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    /** Compile-time Keybound shortcut annotation. Import `react-keybound/jsx` to enable it. */
    hotkey?: string;
  }
}

export {};
