import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { usePwaStore } from '../store/pwaStore';
import { useIsPwa } from '../hooks/usePwa';
import PwaLanding from '../components/PwaLanding';
import { 
  ChevronRight, Radio, Smartphone, BarChart3, 
  Download, CheckCircle2, Users, Sparkles, Menu, X,
  Globe, GraduationCap, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

export default function Landing() {
  const navigate = useNavigate();
  const { isInstallable, installPwa } = usePwaStore();
  const isPwa = useIsPwa();
  const { scrollY } = useScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  if (isPwa) return <PwaLanding />;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await installPwa();
    } else {
      toast.error('App is already installed or check your browser settings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-xl">N</span>
            </div>
            <span className="font-bold tracking-tight text-xl text-white">NEXUS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-zinc-400 hover:text-white">Login</Button>
            <Button onClick={() => navigate('/signup')} className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-6 shadow-lg shadow-white/10 transition-all hover:scale-105">Get Started</Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dual Phone Mockups */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-screen">
        <MotionDiv style={{ y: yHero, opacity: opacityHero }} className="lg:w-1/2 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Education for the Digital Age</span>
          </div>
          <MotionH1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Manage Your Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Like a Pro.</span>
          </MotionH1>
          <MotionP className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            Real-time attendance, instant notifications, and seamless academic management. Built specifically for the <span className="text-white font-semibold">OAU</span> community.
          </MotionP>
          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Button size="lg" onClick={() => navigate('/signup')} className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20">
              Launch Dashboard <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleInstallClick} className="h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
              <Download className="mr-2 h-5 w-5" /> Install App
            </Button>
          </div>
        </MotionDiv>

        {/* Dual Phone Display */}
        <div className="lg:w-1/2 relative flex justify-center gap-6 md:gap-10 py-10">
          {/* Admin Mockup */}
          <MotionDiv 
            initial={{ y: 60, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="w-[200px] md:w-[260px] h-[420px] md:h-[540px] bg-zinc-900 rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl relative overflow-hidden hidden sm:block"
          >
             <div className="p-5 pt-8 space-y-4">
                <div className="flex justify-between items-center"><div className="h-2 w-12 bg-white/20 rounded-full" /><div className="h-4 w-4 bg-indigo-500 rounded-full" /></div>
                <div className="h-24 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center"><Radio className="h-10 w-10 text-indigo-400 animate-pulse" /></div>
                <div className="space-y-2"><div className="h-3 w-full bg-white/10 rounded-full" /><div className="h-3 w-3/4 bg-white/10 rounded-full" /></div>
                <div className="grid grid-cols-2 gap-2"><div className="h-16 bg-white/5 rounded-xl" /><div className="h-16 bg-white/5 rounded-xl" /></div>
             </div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Admin View</div>
          </MotionDiv>

          {/* Student Mockup */}
          <MotionDiv 
            initial={{ y: -60, opacity: 0 }} 
            animate={{ y: -30, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-[200px] md:w-[260px] h-[420px] md:h-[540px] bg-zinc-900 rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl relative overflow-hidden"
          >
             <div className="p-5 pt-8 space-y-6">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-emerald-500/20" /><div className="h-3 w-20 bg-white/20 rounded-full" /></div>
                <div className="h-32 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Attendance Marked</span>
                </div>
                <div className="space-y-3"><div className="h-2 w-full bg-white/5 rounded-full" /><div className="h-2 w-full bg-white/5 rounded-full" /><div className="h-2 w-full bg-white/5 rounded-full" /></div>
             </div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Student View</div>
          </MotionDiv>
        </div>
      </section>

      {/* Global Impact / SDG Section */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/3 text-left space-y-6">
              <div className="h-12 w-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Contributing to Global Goals</h2>
              <p className="text-zinc-400 leading-relaxed">NEXUS is built with a purpose beyond the classroom. We align with the United Nations SDGs to drive academic excellence in Africa.</p>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                <div className="h-12 w-12 bg-indigo-600 rounded-xl mb-6 flex items-center justify-center font-black text-xl">4</div>
                <h4 className="text-xl font-bold mb-3">Quality Education</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">Ensuring inclusive and equitable quality education by digitizing access and reducing administrative friction for students and staff.</p>
              </div>
              <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                <div className="h-12 w-12 bg-emerald-600 rounded-xl mb-6 flex items-center justify-center font-black text-xl">10</div>
                <h4 className="text-xl font-bold mb-3">Reduced Inequalities</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">Creating transparency through tamper-proof records, ensuring every student has equal access to their academic data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BentoCard 
              colSpan={2}
              title="Real-Time Attendance"
              desc="Watch sessions fill up instantly. Geo-fencing ensures students are physically present."
              icon={Radio}
              gradient="from-indigo-500/20 to-purple-500/5"
            >
              <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-50">
                <div className="h-full w-full bg-gradient-to-t from-[#030712] to-transparent absolute z-10 bottom-0" />
                <div className="flex items-end justify-around h-full pb-10 px-6 gap-2">
                  {[40, 70, 50, 90, 65, 85].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full bg-indigo-500/30 rounded-t-sm border-t border-indigo-500/50"
                    />
                  ))}
                </div>
              </div>
            </BentoCard>

            <BentoCard 
              colSpan={1}
              title="PWA Ready"
              desc="Install on iOS and Android. Works offline with background sync."
              icon={Smartphone}
              gradient="from-emerald-500/20 to-teal-500/5"
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#020617] relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Built to Eliminate Manual Attendance — Completely
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            {[
              { title: "For Students", desc: "Mark attendance in seconds, view history, and never worry about records again.", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { title: "For Class Reps", desc: "Start sessions, set time limits, monitor attendance live, and stop impersonation.", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { title: "For Admins", desc: "Access accurate analytics, detect trends, and make informed academic decisions.", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10" }
            ].map((item) => (
              <div key={item.title} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-lg text-left hover:bg-white/[0.04] transition-all">
                <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020617] py-14 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">N</div>
            <div className="flex flex-col">
              <span className="text-white font-bold">NEXUS</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">System Live</span>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <div className="text-sm text-zinc-400">© 2026 NEXUS Suite.</div>
            <div className="text-xs text-zinc-500">Designed by <span className="text-indigo-400 font-bold">Emerald</span> • OAU Campus Edition</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ colSpan, title, desc, icon: Icon, gradient, children }: any) {
  return (
    <motion.div 
      className={`rounded-3xl border border-white/10 bg-[#09090b] overflow-hidden relative group hover:border-white/20 transition-colors ${colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'}`}
      whileHover={{ y: -5 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="p-8 relative z-10 h-full flex flex-col">
        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 mb-6 group-hover:bg-white/10 transition-colors">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">{desc}</p>
        {children}
      </div>
    </motion.div>
  );
}
