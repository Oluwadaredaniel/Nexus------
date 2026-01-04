
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronRight, Radio, Zap, Fingerprint, LogOut, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MotionDiv = motion.div as any;

const slides = [
  {
    id: 1,
    title: "Welcome to NEXUS",
    desc: "The complete academic operating system for Obafemi Awolowo University.",
    icon: <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_60px_-15px_rgba(99,102,241,0.6)]"><span className="text-5xl font-bold text-white">N</span></div>,
    color: "from-indigo-600 to-purple-600"
  },
  {
    id: 2,
    title: "OAU Verified",
    desc: "Secure attendance tracking using your Matric No. No geolocation required.",
    icon: <GraduationCap className="h-24 w-24 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />,
    color: "from-emerald-600 to-teal-600"
  },
  {
    id: 3,
    title: "Instant Updates",
    desc: "Never miss a class or schedule change again. Real-time notifications.",
    icon: <Zap className="h-24 w-24 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />,
    color: "from-amber-600 to-orange-600"
  }
];

export default function PwaLanding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(c => c + 1);
    } else {
      navigate('/login');
    }
  };

  const handleResume = () => {
    if (user?.role === 'super_admin') navigate('/admin');
    else if (user?.role === 'class_rep') navigate('/rep');
    else navigate('/student');
  };

  // --- RENDER: Logged In "Welcome Back" Screen ---
  if (user) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
           <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px]" />
           <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-15 mix-blend-overlay" />
        </div>

        <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center gap-8">
           {/* Avatar Ripple */}
           <div className="relative">
             <MotionDiv 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
             />
             <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 relative z-10 shadow-2xl">
                <div className="h-full w-full rounded-full bg-black/90 flex items-center justify-center text-4xl font-bold text-white">
                  {user.name.charAt(0)}
                </div>
             </div>
           </div>

           <div className="text-center space-y-2">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-zinc-400 text-sm uppercase tracking-widest font-medium">
               Welcome back
             </motion.div>
             <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl font-bold text-white">
               {user.name.split(' ')[0]}
             </motion.h1>
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-zinc-500 text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5 inline-block">
               {user.regNo}
             </motion.p>
           </div>

           <div className="w-full space-y-3 pt-8">
             <Button onClick={handleResume} className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-lg shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
               <Fingerprint className="h-5 w-5" /> Enter Campus
             </Button>
             
             <button onClick={() => navigate('/login')} className="w-full text-center text-zinc-600 text-sm py-2 hover:text-zinc-400 transition-colors flex items-center justify-center gap-2">
               <LogOut className="h-3 w-3" /> Switch Account
             </button>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: Onboarding Slides (Guest) ---
  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-between overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <MotionDiv 
          animate={{ 
            background: [
              `radial-gradient(circle at 50% 50%, #4f46e520 0%, transparent 50%)`,
              `radial-gradient(circle at 50% 50%, #10b98120 0%, transparent 50%)`,
              `radial-gradient(circle at 50% 50%, #f59e0b20 0%, transparent 50%)`
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <MotionDiv 
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center space-y-8 max-w-sm"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {slides[currentSlide].icon}
            </motion.div>
            
            <div className="space-y-3">
              <motion.h1 
                className="text-3xl font-bold text-white tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p 
                className="text-zinc-400 text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {slides[currentSlide].desc}
              </motion.p>
            </div>
          </MotionDiv>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 p-8 pt-0 space-y-8">
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <motion.div 
              key={i}
              className={`h-1.5 rounded-full transition-colors duration-300 ${i === currentSlide ? 'bg-white w-6' : 'bg-white/20 w-1.5'}`}
              layout
            />
          ))}
        </div>

        <div className="space-y-3">
          {currentSlide === slides.length - 1 ? (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button size="lg" className="w-full h-14 text-lg rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold shadow-xl" onClick={() => navigate('/login')}>
                Get Started
              </Button>
              <Button variant="ghost" className="w-full mt-3 text-zinc-500" onClick={() => navigate('/signup')}>
                Create Account
              </Button>
            </MotionDiv>
          ) : (
            <Button size="lg" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md text-white font-medium group" onClick={nextSlide}>
              Continue <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
