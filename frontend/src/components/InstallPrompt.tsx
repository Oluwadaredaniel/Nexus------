
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { usePwaStore } from '../store/pwaStore';
import { useIsPwa } from '../hooks/usePwa';

const MotionDiv = motion.div as any;

export default function InstallPrompt() {
  const { isInstallable, installPwa } = usePwaStore();
  const isPwa = useIsPwa(); // Check if already installed/running as PWA
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If running in PWA mode, never show the install prompt
    if (isPwa) {
      setIsVisible(false);
      return;
    }

    if (isInstallable) {
      const dismissed = localStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isPwa]);

  const handleInstall = async () => {
    await installPwa();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-[100]"
        >
          <div className="p-5 rounded-2xl bg-[#09090b]/90 border border-indigo-500/20 backdrop-blur-xl shadow-2xl shadow-black/50 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-inner">
              <span className="font-bold text-white text-xl">N</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Install NEXUS App</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Get the full experience with offline access and notifications.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-bold">
                  <Download className="h-3 w-3 mr-1.5" /> Install
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5">
                  Later
                </Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
