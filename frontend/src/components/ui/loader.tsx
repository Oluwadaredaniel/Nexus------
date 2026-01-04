
import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Pulsing Core */}
        <MotionDiv
          className="h-16 w-16 bg-primary rounded-2xl shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)]"
          animate={{
            scale: [1, 0.9, 1],
            rotate: [0, 180, 360],
            borderRadius: ["20%", "50%", "20%"]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        
        {/* Orbiting Ring */}
        <MotionDiv
          className="absolute h-24 w-24 border-2 border-primary/30 rounded-full"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        />
        
        <MotionP 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase"
        >
          Initializing Nexus
        </MotionP>
      </div>
    </div>
  );
}
