
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user has already dismissed it recently
      const dismissed = localStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_dismissed', 'true');
    // Reset after 7 days logic could go here
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50"
        >
          <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 border border-primary/20 bg-[#1a1a1e]/90">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <span className="font-bold text-white text-xl">N</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Install NEXUS</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add to your home screen for the best full-screen experience and offline access.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="h-8 text-xs bg-white text-black hover:bg-white/90">
                  <Download className="h-3 w-3 mr-1.5" /> Install App
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs hover:bg-white/10">
                  Maybe Later
                </Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-white/40 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
