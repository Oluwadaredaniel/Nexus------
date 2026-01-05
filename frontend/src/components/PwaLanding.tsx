import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  ChevronRight,
  Zap,
  Fingerprint,
  LogOut,
  GraduationCap,
  Home,
  Users,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MotionDiv = motion.div as any;

/* ---------------- SLIDES ---------------- */
const slides = [
  {
    id: 1,
    title: 'Welcome to NEXUS',
    desc: 'A mobile-first academic operating system built for speed, accuracy, and trust.',
    icon: (
      <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_60px_-15px_rgba(99,102,241,0.6)]">
        <span className="text-5xl font-bold text-white">N</span>
      </div>
    )
  },
  {
    id: 2,
    title: 'Verified Attendance',
    desc: 'Attendance tied to real student identities. No paper. No impersonation.',
    icon: (
      <GraduationCap className="h-24 w-24 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
    )
  },
  {
    id: 3,
    title: 'Built for Reps',
    desc: 'Create sessions, track turnout, and manage classes in seconds.',
    icon: (
      <Users className="h-24 w-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
    )
  },
  {
    id: 4,
    title: 'Live & Instant',
    desc: 'Real-time updates, notifications, and attendance sync.',
    icon: (
      <Zap className="h-24 w-24 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
    )
  },
  {
    id: 5,
    title: 'Actionable Insights',
    desc: 'Admins get clean data, trends, and analytics that actually matter.',
    icon: (
      <BarChart3 className="h-24 w-24 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
    )
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

  /* ---------------- LOGGED IN VIEW ---------------- */
  if (user) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden relative">

        {/* Back to Website */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition"
        >
          <Home className="h-4 w-4" /> Website
        </button>

        {/* Ambient BG */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-indigo-600/20 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-cyan-600/10 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center gap-8">

          {/* Avatar */}
          <div className="relative">
            <MotionDiv
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
            />
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 relative z-10">
              <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-4xl font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-zinc-400 text-xs uppercase tracking-widest">Welcome back</p>
            <h1 className="text-3xl font-bold">{user.name.split(' ')[0]}</h1>
            <span className="text-xs text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {user.regNo}
            </span>
          </div>

          <div className="w-full space-y-3 pt-6">
            <Button
              onClick={handleResume}
              className="w-full h-14 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-5 w-5" /> Enter Campus
            </Button>

            <button
              onClick={() => navigate('/login')}
              className="w-full text-center text-zinc-500 text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="h-3 w-3" /> Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- GUEST / ONBOARDING ---------------- */
  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-between overflow-hidden">

      {/* Back to Website */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition"
      >
        <Home className="h-4 w-4" /> Website
      </button>

      {/* Ambient BG */}
      <div className="absolute inset-0">
        <MotionDiv
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, #4f46e520 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, #10b98120 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, #06b6d420 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center space-y-8 max-w-sm"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              {slides[currentSlide].icon}
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold">{slides[currentSlide].title}</h1>
              <p className="text-zinc-400 text-lg">{slides[currentSlide].desc}</p>
            </div>
          </MotionDiv>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="relative z-10 p-8 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              layout
              className={`h-1.5 rounded-full ${i === currentSlide ? 'bg-white w-6' : 'bg-white/20 w-1.5'}`}
            />
          ))}
        </div>

        {currentSlide === slides.length - 1 ? (
          <>
            <Button className="w-full h-14 rounded-2xl bg-white text-black text-lg font-bold" onClick={() => navigate('/login')}>
              Get Started
            </Button>
            <Button variant="ghost" className="w-full text-zinc-500" onClick={() => navigate('/signup')}>
              Create Account
            </Button>
          </>
        ) : (
          <Button
            className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/5"
            onClick={nextSlide}
          >
            Continue <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
