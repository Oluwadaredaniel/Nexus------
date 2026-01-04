
import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b]">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        <div className="relative">
          {/* Logo Animation */}
          <MotionDiv
            className="h-20 w-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.6)] flex items-center justify-center z-10 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-4xl font-bold text-white">N</span>
          </MotionDiv>
          
          {/* Ripple Effect */}
          <MotionDiv 
            className="absolute inset-0 border border-indigo-500/50 rounded-3xl"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        <div className="flex flex-col items-center space-y-2">
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold tracking-tight text-white"
          >
            NEXUS
          </MotionDiv>
          
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-indigo-400 font-mono tracking-[0.2em] uppercase"
          >
            Initializing System
          </MotionDiv>
        </div>
      </div>

      {/* Bottom Loading Bar */}
      <div className="absolute bottom-16 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <MotionDiv 
          className="h-full bg-indigo-500 rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
