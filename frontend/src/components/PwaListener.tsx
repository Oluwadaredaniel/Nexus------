
import { useEffect } from 'react';
import { usePwaStore } from '../store/pwaStore';

export default function PwaListener() {
  const setPrompt = usePwaStore((state) => state.setPrompt);
  const clearPrompt = usePwaStore((state) => state.clearPrompt);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setPrompt(e);
    };

    const installedHandler = () => {
      clearPrompt();
      console.log('PWA Installed');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [setPrompt, clearPrompt]);

  return null;
}