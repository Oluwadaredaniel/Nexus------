
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const MotionDiv = motion.div as any;

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className={cn("bg-[#09090b] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden", className)}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </MotionDiv>
        </motion.div>
      )}
    </AnimatePresence>
  );
}