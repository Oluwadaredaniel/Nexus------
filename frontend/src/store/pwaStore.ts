
import { create } from 'zustand';

interface PwaState {
  deferredPrompt: any;
  isInstallable: boolean;
  setPrompt: (prompt: any) => void;
  installPwa: () => Promise<void>;
  clearPrompt: () => void;
}

export const usePwaStore = create<PwaState>((set, get) => ({
  deferredPrompt: null,
  isInstallable: false,
  setPrompt: (prompt) => {
    console.log('PWA Prompt Stored');
    set({ deferredPrompt: prompt, isInstallable: true });
  },
  clearPrompt: () => set({ deferredPrompt: null, isInstallable: false }),
  installPwa: async () => {
    const prompt = get().deferredPrompt;
    if (!prompt) {
      console.warn('No deferred prompt available');
      return;
    }
    
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      set({ deferredPrompt: null, isInstallable: false });
    }
  },
}));