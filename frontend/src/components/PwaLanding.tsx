import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Zap,
  ShieldCheck,
  Radio,
  Smartphone,
  BarChart3,
  Fingerprint,
  LogOut,
  Home
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../store/authStore';

const MotionDiv = motion.div as any;

/* -------------------------------- SLIDES -------------------------------- */

const slides = [
  {
    title: 'Welcome to NEXUS',
    desc: 'The academic operating system built for modern campuses.',
    icon: <span className="text-6xl font-black text-white">N</span>,
    accent: 'from-indigo-600 to-purple-600'
  },
  {
    title: 'Verified Attendance',
    desc: 'Secure, tamper-proof attendance tied to your academic identity.',
    icon: <Radio className="h-24 w-24 text-indigo-400" />,
    accent: 'from-indigo-600 to-cyan-600'
  },
  {
    title: 'No GPS Tracking',
    desc: 'No location spying. No battery drain. Just smart verification.',
    icon: <ShieldCheck className="h-24 w-24 text-emerald-400" />,
    accent: 'from-emerald-600 to-teal-600'
  },
  {
    title: 'Instant Notifications',
    desc: 'Lecture updates, attendance alerts, and announcements in real time.',
    icon: <Zap className="h-24 w-24 text-amber-400" />,
    accent: 'from-amber-600 to-orange-600'
  },
  {
    title: 'Install Once',
    desc: 'Works offline. Feels native. No app store required.',
    icon: <Smartphone className="h-24 w-24 text-purple-400" />,
    accent: 'from-purple-600 to-indigo-600'
  },
  {
    title: 'Real Analytics',
    desc: 'Admins and reps get insights, not guesses.',
    icon: <BarChart3 className="h-24 w-24 text-cyan-400" />,
    accent: 'from-cyan-600 to-blue-600'
  }
];

export default function PwaLanding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showIntro, setShowIntro] = useState(false);

  const hasOnboarded =
    localStorage.getItem('pwa_onboarded') === 'true';

  /* -------------------- FIRST-TIME AUTO SHOW -------------------- */
  useEffect(() => {
    if (!hasOnboarded) {
      setShowIntro(true);
    }
  }, [hasOnboarded]);

  /* ------------------------ SLIDE CONTROL ------------------------ */

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      localStorage.setItem('pwa_onboarded', 'true');
      setShowIntro(false);
      navigate('/login');
    }
  };

  const enterCampus = () => {
    if (user?.role === 'super_admin') navigate('/admin');
    else if (user?.role === 'class_rep') navigate('/rep');
    else navigate('/student');
  };

  /* ======================= ENTER CAMPUS VIEW ======================= */

  if (user && !showIntro) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-30%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 mix-blend-overlay" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-sm px-8 text-center space-y-8"
        >
          <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
            {user.name.charAt(0)}
          </div>

          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">
              Welcome back
            </p>
            <h1 className="text-3xl font-bold text-white mt-1">
              {user.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-zinc-500 mt-2">{user.regNo}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={enterCampus}
              className="w-full h-14 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200"
            >
              <Fingerprint className="mr-2 h-5 w-5" />
              Enter Campus
            </Button>

            {/* ✅ THIS IS THE HOME BUTTON */}
            <button
              onClick={() => {
                setCurrentSlide(0);
                setShowIntro(true);
              }}
              className="flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-white transition"
            >
              <Home className="h-3 w-3" />
              View App Intro
            </button>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition"
            >
              <LogOut className="h-3 w-3" />
              Switch Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ======================= ONBOARDING SLIDES ======================= */

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, #4f46e530 0%, transparent 55%)',
                'radial-gradient(circle at 50% 50%, #06b6d430 0%, transparent 55%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror' }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="text-center max-w-sm space-y-8"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className={`mx-auto h-28 w-28 rounded-3xl bg-gradient-to-tr ${slides[currentSlide].accent} flex items-center justify-center shadow-2xl`}
              >
                {slides[currentSlide].icon}
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-zinc-400 text-lg mt-3 leading-relaxed">
                  {slides[currentSlide].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 p-8 space-y-6">
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <motion.div
                key={i}
                layout
                className={`h-1.5 rounded-full ${
                  i === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <Button
            size="lg"
            onClick={nextSlide}
            className="w-full h-14 rounded-2xl bg-white text-black font-semibold hover:bg-zinc-200"
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
