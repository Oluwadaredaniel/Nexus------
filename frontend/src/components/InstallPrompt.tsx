
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from './ui/button';
import { usePwaStore } from '../store/pwaStore';

const MotionDiv = motion.div as any;

export default function InstallPrompt() {
  const { deferredPrompt, installPwa } = usePwaStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already standalone (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 2. Check if user already dismissed
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    // 3. Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // 4. Show prompt if: (Android/Desktop event fired) OR (iOS device detected)
    if (deferredPrompt || iOS) {
      // Small delay to be less intrusive on load
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (!isIOS && deferredPrompt) {
      await installPwa();
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <MotionDiv
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-[24rem] z-50"
        >
          <div className="glass-panel rounded-2xl p-5 border border-primary/20 bg-[#1a1a1e]/95 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <span className="font-bold text-white text-xl">N</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Install NEXUS App</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isIOS 
                    ? "Install for the best experience. Tap the Share button below and select 'Add to Home Screen'."
                    : "Add to your home screen for the best full-screen experience and offline access."}
                </p>
                
                {isIOS ? (
                  <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400 bg-white/5 p-2 rounded-lg">
                    <span className="flex items-center gap-1"><Share className="h-3 w-3" /> Share</span>
                    <span>→</span>
                    <span className="flex items-center gap-1"><PlusSquare className="h-3 w-3" /> Add to Home Screen</span>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleInstallClick} className="h-8 text-xs bg-white text-black hover:bg-white/90 font-bold transition-all hover:scale-105">
                      <Download className="h-3 w-3 mr-1.5" /> Install App
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs hover:bg-white/10 text-white/70 hover:text-white">
                      Maybe Later
                    </Button>
                  </div>
                )}
              </div>
              <button onClick={handleDismiss} className="text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}