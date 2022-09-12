import '../styles/globals.css';

import {
  useIsTelegramWebAppReady,
  withTelegramWebApp,
} from 'react-telegram-webapp';

import axios from 'axios';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const isTelegramWebAppReady = useIsTelegramWebAppReady();

  if (!isTelegramWebAppReady) return null;
  return <Component {...pageProps} />;
}

async function validateHash(hash: string): Promise<boolean> {
  const { data } = await axios.post('/api/validate-hash', {
    hash,
  });

  return data.ok;
}

export default dynamic(
  () => Promise.resolve(withTelegramWebApp(MyApp, { validateHash })),
  { ssr: false }
);
