import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { usePwaStore } from '../store/pwaStore';
import { useIsPwa } from '../hooks/usePwa';
import PwaLanding from './PwaLanding';
import { 
  ChevronRight, ShieldCheck, Zap, Radio, 
  Smartphone, BarChart3, Download, CheckCircle2, 
  Lock, Sparkles, Menu, X, Users // Added Users to fix the error
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
  
  const yHero = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const yStats = useTransform(scrollY, [300, 800], [50, -50]);

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
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-[0.15] mix-blend-overlay" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-xl">N</span>
            </div>
            <span className="font-bold tracking-tight text-xl text-white hidden sm:block">NEXUS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-zinc-400 hover:text-white hover:bg-white/5">Login</Button>
            <Button size="sm" onClick={() => navigate('/signup')} className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-6 h-10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">Get Started</Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 flex flex-col items-center justify-center min-h-[90vh]">
        <MotionDiv style={{ y: yHero, opacity: opacityHero }} className="text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Next Gen Academic Suite</span>
          </div>
          <MotionH1 className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.1] text-white">
            Manage Your Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Like a Pro.</span>
          </MotionH1>
          <MotionP className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Real-time attendance, instant notifications, and seamless academic management. 
            Built for <span className="text-white font-semibold">OAU</span> students, reps, and admins.
          </MotionP>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
            <Button size="lg" onClick={() => navigate('/signup')} className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]">
              Launch Dashboard <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleInstallClick} className="h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white">
              <Download className="mr-2 h-5 w-5" /> Install App
            </Button>
          </div>
        </MotionDiv>
      </section>

      {/* Why Nexus Section with Icons */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#020617] relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Built to Eliminate Manual Attendance — Completely
          </h2>
          <p className="text-zinc-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Nexus replaces paper-based attendance and manual record keeping with a 
            <span className="text-white font-semibold"> real-time, verifiable system</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            {[
              { title: "For Students", desc: "Mark attendance in seconds, view history, and never worry about records again.", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { title: "For Class Reps", desc: "Start sessions, set time limits, monitor attendance live, and stop impersonation.", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { title: "For Admins", desc: "Access accurate analytics, detect trends, and make informed academic decisions.", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10" }
            ].map((item, i) => (
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

      {/* Footer with Live Status & 2026 */}
      <footer className="border-t border-white/5 bg-[#020617] py-14 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">N</div>
            <div className="flex flex-col">
              <span className="text-white font-bold tracking-wide">NEXUS</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">System Live</span>
              </div>
            </div>
          </div>

          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="text-sm text-zinc-400">© 2026 NEXUS.</div>
            <div className="text-xs text-zinc-500">
              Designed by <a href="https://www.tiktok.com/@dev_boy09" className="text-indigo-400 font-bold hover:text-indigo-300">Emerald</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}<div className="h-full w-full bg-gradient-to-t from-[#09090b] to-transparent absolute z-10 bottom-0" />
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
            >
               <div className="absolute inset-0 flex items-center justify-center opacity-30">
                 <Smartphone className="w-40 h-40 text-emerald-500" />
               </div>
            </BentoCard>

            <BentoCard 
              colSpan={1}
              title="Secure Identity"
              desc="Digital ID cards with QR verification. No more plastic cards."
              icon={ShieldCheck}
              gradient="from-orange-500/20 to-red-500/5"
            />

            <BentoCard 
              colSpan={2}
              title="Smart Analytics"
              desc="Deep insights into attendance trends, course popularity, and student engagement."
              icon={BarChart3}
              gradient="from-blue-500/20 to-cyan-500/5"
            >
               <div className="absolute bottom-6 right-6 flex gap-3">
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400">Weekly Report</div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400">Export PDF</div>
               </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* --- Mobile Experience Section --- */}
      <section className="py-32 border-t border-white/5 bg-gradient-to-b from-[#030712] to-[#0f172a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
              <Zap className="h-3 w-3" /> Native Performance
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              A Native App Experience, <br />
              <span className="text-zinc-500">Without the App Store.</span>
            </h2>
            <div className="space-y-4">
              {[
                "Zero Friction Install",
                "Works Offline",
                "Instant Updates",
                "Battery Optimized"
              ].map((item, i) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-lg text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
            <Button size="lg" onClick={handleInstallClick} className="mt-4 rounded-full bg-white text-black hover:bg-zinc-200">
              Install to Home Screen
            </Button>
          </div>

          {/* Phone Frame Mockup */}
          <div className="flex-1 relative flex justify-center">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-[300px] h-[600px] bg-black border-[8px] border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden z-10"
            >
              <div className="w-full h-full bg-[#09090b] p-5 pt-12 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <div className="text-xs text-zinc-500">Welcome back</div>
                       <div className="font-bold text-white text-lg">Student</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
                 </div>
                 <div className="bg-indigo-600 rounded-2xl p-4 mb-4 shadow-lg shadow-indigo-500/20">
                    <div className="flex justify-between mb-6">
                       <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">CSC 201</span>
                       <Radio className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="font-bold text-white text-lg">Data Structures</div>
                    <div className="text-xs text-indigo-200 mt-1">Lecture Theatre A</div>
                 </div>
                 <div className="flex-1 space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5" />
                    ))}
                 </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Platform Impact / Why Nexus --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#020617] relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Built to Eliminate Manual Attendance — Completely
          </h2>

          <p className="text-zinc-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Nexus replaces paper-based attendance, guesswork, and manual record keeping with a 
            <span className="text-white font-semibold"> real-time, verifiable, and auditable system</span>. 
            Students mark attendance effortlessly, class reps manage sessions with control, 
            and administrators gain accurate insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            {[
              {
                title: "For Students",
                desc: "Mark attendance in seconds, view history, and never worry about missing records again.",
                icon: CheckCircle2,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
              },
              {
                title: "For Class Reps",
                desc: "Start sessions, set time limits, monitor attendance live, and eliminate impersonation.",
                icon: Users,
                color: "text-indigo-400",
                bg: "bg-indigo-500/10"
              },
              {
                title: "For Admins",
                desc: "Access accurate analytics, detect trends, validate data, and make informed academic decisions.",
                icon: BarChart3,
                color: "text-purple-400",
                bg: "bg-purple-500/10"
              }
            ].map((item, i) => (
              <div
                key={item.title}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-lg text-left hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-500 pt-8 uppercase tracking-widest opacity-50">
            Digital Transformation • Institutional Accountability • Quality Education
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 bg-[#020617] py-14 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-500">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold leading-tight tracking-wide">NEXUS</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                   System Operational
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="font-medium">© 2026 NEXUS.</div>
            <div className="text-xs">
              Designed by{" "}
              <a
                href="https://www.tiktok.com/@dev_boy09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
              >
                Emerald
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --- Sub Components --- */

function Hero3DMockup() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  return (
    <div 
      className="relative z-10 w-full max-w-4xl mt-16 perspective-1000"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div 
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, rotateX: 20, y: 100 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-full aspect-[16/9] bg-[#09090b] rounded-2xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden relative group"
      >
        <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
           <div className="flex gap-1.5">
             <div className="h-3 w-3 rounded-full bg-red-500/50" />
             <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
             <div className="h-3 w-3 rounded-full bg-green-500/50" />
           </div>
           <div className="ml-4 h-4 w-64 bg-white/5 rounded-full" />
        </div>
        
        <div className="p-6 grid grid-cols-4 gap-6 h-full">
           <div className="col-span-1 bg-white/5 rounded-xl border border-white/5 h-4/5 hidden md:block" />
           <div className="col-span-4 md:col-span-3 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                 <div className="h-24 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20" />
                 <div className="h-24 rounded-xl bg-white/5 border border-white/5" />
                 <div className="h-24 rounded-xl bg-white/5 border border-white/5" />
              </div>
              <div className="h-64 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent opacity-50" />
                 <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-around px-4 pb-4 gap-2">
                    {[30, 50, 40, 70, 50, 80, 60, 90, 75].map((h, i) => (
                       <motion.div 
                         key={i}
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                         className="w-full bg-indigo-500 rounded-t-sm opacity-60"
                       />
                    ))}
                 </div>
              </div>
           </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}

function BentoCard({ colSpan, title, desc, icon: Icon, gradient, children }: any) {
  return (
    <motion.div 
      className={`rounded-3xl border border-white/10 bg-[#09090b] overflow-hidden relative group hover:border-white/20 transition-colors md:col-span-${colSpan}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="p-8 relative z-10 h-full flex flex-col">
        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 mb-6 group-hover:bg-white/10 transition-colors">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">{desc}</p>
        <div className="flex-1" />
        {children}
      </div>
    </motion.div>
  )
}
