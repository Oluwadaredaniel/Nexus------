
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { 
  ChevronRight, ShieldCheck, Zap, Radio, 
  Smartphone, BarChart3, ArrowRight, Download, Users, Layers
} from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, sessions: 0, active: 0 });
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    // Simulate splash screen delay + fetch stats
    const init = async () => {
      try {
        const res = await api.get('/auth/stats');
        setStats(res.data);
      } catch(e) {
        // Fallback for demo
        setStats({ students: 1250, sessions: 85, active: 3 });
      }
      setTimeout(() => setLoading(false), 2200);
    };
    init();
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-primary/30 overflow-x-hidden">
        
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-bold text-white text-xl">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden md:block">NEXUS</span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-xs" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
          {/* Ambient Background */}
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
             <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 mix-blend-overlay" />
          </div>

          <MotionDiv style={{ y: heroY, opacity }} className="relative z-10 max-w-4xl space-y-8">
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 2.3, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">System Online</span>
            </MotionDiv>

            <MotionH1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.4, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.95]"
            >
              Your Campus <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-300 to-cyan-300">
                In Your Pocket.
              </span>
            </MotionH1>

            <MotionP 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6, duration: 0.8 }}
              className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              Experience the next generation of academic management. Real-time attendance, instant notifications, and offline-first reliability.
            </MotionP>

            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-full text-lg font-bold shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] hover:scale-105 transition-transform"
                onClick={() => navigate('/signup')}
              >
                Get Started <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 rounded-full text-lg border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md"
                onClick={() => navigate('/login')}
              >
                Member Login
              </Button>
            </MotionDiv>
          </MotionDiv>
        </section>

        {/* Stats Scroller */}
        <div className="w-full border-y border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden py-8">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
              <StatItem value={stats.students.toLocaleString()} label="Students" delay={0} />
              <StatItem value={stats.sessions.toLocaleString()} label="Sessions" delay={0.2} />
              <StatItem value={stats.active.toLocaleString()} label="Active Now" delay={0.4} isLive />
           </div>
        </div>

        {/* Features Grid */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Engineered for Speed</h2>
              <p className="text-zinc-400">Native-grade performance on the web.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               <FeatureCard 
                 icon={Radio} 
                 title="Real-Time Sync" 
                 desc="Attendance data propagates instantly across all dashboards using WebSocket technology."
               />
               <FeatureCard 
                 icon={Smartphone} 
                 title="PWA Ready" 
                 desc="Install on your home screen. Works offline. Zero app store friction."
               />
               <FeatureCard 
                 icon={ShieldCheck} 
                 title="Geo-Fencing" 
                 desc="Verify physical presence with location-based attendance validation."
               />
               <FeatureCard 
                 icon={Layers} 
                 title="Dynamic Hierarchy" 
                 desc="Flexible academic structure supporting Faculties, Departments, and detailed Options."
               />
               <FeatureCard 
                 icon={BarChart3} 
                 title="Instant Analytics" 
                 desc="Visual insights into attendance trends and participation rates."
               />
               <FeatureCard 
                 icon={Zap} 
                 title="Low Latency" 
                 desc="Optimized for edge performance, ensuring smooth interactions even on mobile data."
               />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none" />
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to join?</h2>
            <p className="text-xl text-zinc-400">Access your academic portal today.</p>
            <Button size="lg" className="h-16 px-12 rounded-full text-xl font-bold bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105" onClick={() => navigate('/login')}>
              Launch App <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </MotionDiv>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-6 bg-black/20 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
            <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="font-bold text-[10px]">N</span>
            </div>
            <span className="font-bold text-sm tracking-widest">NEXUS</span>
          </div>
          <p className="text-xs text-zinc-600">© 2024 NEXUS Academic Suite. Built for Performance.</p>
        </footer>

      </div>
    </>
  );
}

function SplashScreen() {
  return (
    <MotionDiv 
      className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center"
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="relative">
        <MotionDiv 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-24 w-24 bg-gradient-to-tr from-primary to-cyan-500 rounded-3xl flex items-center justify-center shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)]"
        >
          <span className="text-5xl font-bold text-white">N</span>
        </MotionDiv>
        <MotionDiv 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
          className="absolute -bottom-8 left-0 h-1 bg-white/20 rounded-full overflow-hidden"
        >
          <MotionDiv 
            className="h-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
          />
        </MotionDiv>
      </div>
    </MotionDiv>
  );
}

function StatItem({ value, label, delay, isLive }: any) {
  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-2">
        {value}
        {isLive && <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>}
      </div>
      <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">{label}</div>
    </MotionDiv>
  )
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <MotionDiv 
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all group"
    >
      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-6">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </MotionDiv>
  )
            }-indigo-600 mb-4 shadow-lg shadow-indigo-500/20">
                       <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded text-white">CSC 401</span>
                          <Radio className="h-4 w-4 animate-pulse text-white" />
                       </div>
                       <div className="text-lg font-bold text-white">Software Eng.</div>
                       <div className="text-xs text-indigo-200">AJOF Hall • Live Now</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                          <div className="text-2xl font-bold text-white">88%</div>
                          <div className="text-[10px] text-zinc-500">Attendance</div>
                       </div>
                       <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                          <div className="text-2xl font-bold text-white">12</div>
                          <div className="text-[10px] text-zinc-500">Courses</div>
                       </div>
                    </div>
                 </div>
              </PhoneFrame>
              <p className="text-center text-zinc-500 mt-6 font-medium">Real-time Dashboard</p>
           </div>

           {/* Phone 2: Digital ID (Center) */}
           <div className="relative z-20 transform scale-105 shadow-2xl">
              <PhoneFrame borderColor="border-indigo-500/30">
                 <div className="p-5 pt-12 flex flex-col h-full bg-[#020617] items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-xl" />
                    <div className="relative z-10 text-center w-full">
                       <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-xl">
                          A
                       </div>
                       <h3 className="text-xl font-bold text-white">Alex Doe</h3>
                       <p className="text-indigo-400 text-sm font-mono mb-6">CSC/2019/001</p>
                       <div className="bg-white p-3 rounded-xl mx-auto w-40 h-40 flex items-center justify-center mb-4">
                          <QrCode className="h-32 w-32 text-black" />
                       </div>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-widest">OAU Verified Student</p>
                    </div>
                 </div>
              </PhoneFrame>
              <p className="text-center text-indigo-400 mt-6 font-bold">Digital Identity</p>
           </div>

           {/* Phone 3: Attendance History */}
           <div className="relative z-10 transform lg:translate-y-12">
              <PhoneFrame>
                 <div className="p-5 pt-12 flex flex-col h-full bg-[#09090b]">
                    <div className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">History</div>
                    <div className="space-y-3">
                       {[1,2,3,4].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                   <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div>
                                   <div className="text-sm font-bold text-white">MTH 201</div>
                                   <div className="text-[10px] text-zinc-500">10:00 AM</div>
                                </div>
                             </div>
                             <div className="text-xs font-mono text-zinc-400">Oct {i+10}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              </PhoneFrame>
              <p className="text-center text-zinc-500 mt-6 font-medium">Instant Records</p>
           </div>
        </div>
      </section>

      {/* --- Workflow / How It Works --- */}
      <section className="py-24 bg-black/40 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Seamless Workflow</h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">From setup to insights, NEXUS streamlines every step.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            
            {[
              { icon: Server, title: "Structure", desc: "Admins configure faculties and courses." },
              { icon: Radio, title: "Initiate", desc: "Reps start secure, geo-fenced sessions." },
              { icon: Smartphone, title: "Verify", desc: "Students check-in via their device." },
              { icon: BarChart3, title: "Analyze", desc: "Instant data syncs to dashboards." },
            ].map((step, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="h-24 w-24 rounded-2xl bg-[#09090b] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon className="h-10 w-10 text-indigo-400" />
                  <div className="absolute -bottom-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">
                    STEP 0{i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* --- The Solution (Bento Grid) --- */}
      <section id="features" className="py-32 px-6 relative z-10 bg-[#020617]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Engineered for Scale</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Capabilities designed to handle the complexity of modern university environments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Main Feature: Live Sessions */}
            <MotionDiv 
              className="md:col-span-4 md:row-span-2 rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/10 p-10 flex flex-col relative overflow-hidden group shadow-2xl"
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 bg-grid-white/[0.03] bg-[length:32px_32px]" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex-1">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                  <Radio className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Live Session Monitoring</h3>
                <p className="text-zinc-400 text-lg max-w-md">Real-time attendance telemetry. Watch sessions populate instantly as students check in via geolocation and unique codes.</p>
              </div>
              
              {/* Visual Mockup inside card */}
              <div className="mt-10 relative h-72 w-full bg-[#020617]/80 rounded-t-2xl border-t border-l border-r border-white/10 p-6 backdrop-blur-xl translate-y-6 group-hover:translate-y-4 transition-transform duration-500 shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="h-2 w-24 rounded-full bg-white/10" />
                 </div>
                 <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-14 w-full rounded-xl bg-white/5 border border-white/5 flex items-center px-5 justify-between">
                         <div className="flex gap-4 items-center">
                           <div className="h-8 w-8 rounded-full bg-white/10" />
                           <div className="space-y-1.5">
                             <div className="h-2 w-24 rounded-full bg-white/10" />
                             <div className="h-1.5 w-16 rounded-full bg-white/5" />
                           </div>
                         </div>
                         <div className="flex items-center gap-2 text-emerald-500/50 text-xs">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                           Live
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </MotionDiv>

            {/* Feature: Analytics */}
            <MotionDiv 
              className="md:col-span-2 md:row-span-1 rounded-3xl bg-[#09090b] border border-white/10 p-8 flex flex-col relative overflow-hidden shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative z-10 mb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">Insight Engine</h3>
              </div>
              <div className="flex-1 min-h-[120px] w-[110%] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorVal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </MotionDiv>

            {/* Feature: Global Access */}
            <MotionDiv 
              className="md:col-span-2 md:row-span-1 rounded-3xl bg-[#09090b] border border-white/10 p-8 flex flex-col justify-between shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-4">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Campus-Wide</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Scales effortlessly from single departments to entire faculties without latency.
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* --- Mobile Experience (PWA) --- */}
      <section className="py-40 px-6 border-t border-white/5 bg-gradient-to-b from-[#020617] to-[#0f172a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <MotionDiv 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-6 border border-white/10">
                <Smartphone className="h-3.5 w-3.5" /> PWA Ready
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">Your Campus <br /> in Your Pocket.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mt-6">
                NEXUS is built as a Progressive Web App. Install it directly to your device for a native-like experience. 
                Fast, responsive, and works even with spotty connectivity.
              </p>
              
              <div className="grid grid-cols-1 gap-4 mt-8">
                {['Zero App Store Friction', 'Offline Synchronization', 'Real-time Push Notifications', 'Low Battery Usage'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                       <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    </div>
                    <span className="text-zinc-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>

          <div className="flex-1 flex justify-center perspective-1000">
             <div className="bg-indigo-500/10 p-10 rounded-full">
               <Download className="h-32 w-32 text-indigo-500 animate-bounce" />
             </div>
          </div>
        </div>
      </section>

      {/* --- Security Section --- */}
      <section id="security" className="py-24 bg-white/[0.02] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-6">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Safety First</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Uncompromising Data Protection</h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-[#09090b] border border-white/10 hover:border-emerald-500/30 transition-colors">
              <Lock className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-white text-lg mb-2">End-to-End Encryption</h3>
              <p className="text-zinc-400 text-sm">All academic records and student data are encrypted at rest and in transit using industry-standard protocols.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#09090b] border border-white/10 hover:border-emerald-500/30 transition-colors">
              <Fingerprint className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-white text-lg mb-2">Identity Verification</h3>
              <p className="text-zinc-400 text-sm">Multi-factor authentication and strict device binding ensure that attendance data is authentic and verifiable.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#09090b] border border-white/10 hover:border-emerald-500/30 transition-colors">
              <History className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-white text-lg mb-2">Audit Trails</h3>
              <p className="text-zinc-400 text-sm">Every action within the system is logged and auditable, providing complete transparency for administrators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Target Audience (Abstracted) --- */}
      <section id="institutions" className="py-32 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Empowering OAU & Beyond</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Designed to serve every stakeholder in the academic process, specifically tailored for Obafemi Awolowo University.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <RoleCard 
              title="Administration" 
              desc="Gain oversight with high-level dashboards and automated reporting tools. Make data-driven decisions." 
            />
            <RoleCard 
              title="Faculty Staff" 
              desc="Streamline session management and focus on teaching, not paperwork. Automated record keeping." 
            />
            <RoleCard 
              title="Student Body" 
              desc="Transparent attendance records and effortless digital check-ins. Access academic history instantly." 
            />
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-40 px-6 text-center relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-10 relative">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white">Ready to Modernize?</h2>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto">Join the institutions moving towards a smarter, data-driven academic future.</p>
          <div className="flex justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105 font-bold">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 bg-[#020617] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <span className="font-bold text-indigo-400 text-sm">N</span>
            </div>
            <div>
              <span className="font-bold text-white block">NEXUS</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Academic Suite</span>
            </div>
          </div>
          
          <div className="text-sm text-zinc-500 text-center md:text-right flex flex-col gap-2">
            <p>Designed by <a href="https://www.tiktok.com/@dev_boy09" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 hover:underline font-medium transition-colors">Emerald</a></p>
            <p>© 2024 NEXUS. Exclusively for Obafemi Awolowo University.</p>
            <div className="flex gap-6 justify-center md:justify-end mt-2">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Utility Components

function PhoneFrame({ children, borderColor = "border-zinc-800" }: { children?: React.ReactNode, borderColor?: string }) {
  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative w-[280px] h-[580px] bg-black border-[8px] ${borderColor} rounded-[3rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden shrink-0`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-xl z-20" />
      {children}
    </MotionDiv>
  );
}

function FeatureText({ icon: Icon, title, desc, delay }: any) {
  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="space-y-4 group"
    >
      <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
        <Icon className="h-7 w-7 text-white group-hover:text-indigo-400 transition-colors" />
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-lg">{desc}</p>
    </MotionDiv>
  )
}

function RoleCard({ title, desc }: any) {
  return (
    <MotionDiv 
      whileHover={{ y: -5 }}
      className="p-10 rounded-3xl bg-[#09090b] border border-white/5 hover:border-indigo-500/30 transition-all shadow-lg hover:shadow-indigo-500/5"
    >
      <div className="h-1.5 w-12 bg-indigo-500 rounded-full mb-8" />
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </MotionDiv>
  )
}
