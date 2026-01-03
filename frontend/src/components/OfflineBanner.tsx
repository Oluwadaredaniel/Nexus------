
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <MotionDiv
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-500/10 border-b border-red-500/20 backdrop-blur-md relative z-[100]"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-red-400">
            <WifiOff className="h-3 w-3" />
            <span>You are currently offline. Some features may be limited.</span>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}