import '../styles/globals.css';

import {
  useIsTelegramWebAppReady,
  withTelegramWebApp,
} from 'react-telegram-webapp';

import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const isTelegramWebAppReady = useIsTelegramWebAppReady();

  if (!isTelegramWebAppReady) return null;
  return <Component {...pageProps} />;
}

function validateHash(hash: string): boolean {
  return true;
}

export default dynamic(
  () => Promise.resolve(withTelegramWebApp(MyApp, { validateHash })),
  { ssr: false }
);
