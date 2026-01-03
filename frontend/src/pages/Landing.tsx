
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { usePwaStore } from '../store/pwaStore';
import { 
  ChevronRight, ShieldCheck, Users, BarChart3, Radio, Download, 
  Smartphone, Zap, Globe, Layers, ArrowRight, BookOpen, Lock, Activity,
  Server, Fingerprint, History, MapPin, QrCode, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const MotionDiv = motion.div as any;

// Mock Data for Analytics Preview
const chartData = [
  { name: 'W1', value: 400 },
  { name: 'W2', value: 600 },
  { name: 'W3', value: 550 },
  { name: 'W4', value: 800 },
  { name: 'W5', value: 750 },
  { name: 'W6', value: 950 },
  { name: 'W7', value: 1100 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isInstallable, installPwa } = usePwaStore();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await installPwa();
    } else {
      toast.error('App is already installed or not supported in this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]" />
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl transition-all duration-300 supports-[backdrop-filter]:bg-[#020617]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-lg">N</span>
            </div>
            <span className="font-bold tracking-tight text-xl text-white">NEXUS</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#gallery" className="hover:text-white transition-colors">Interface</a>
              <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
            </div>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <Button size="sm" onClick={() => navigate('/login')} className="bg-white text-black hover:bg-zinc-200 font-semibold rounded-full px-6 h-10 shadow-lg shadow-white/5 transition-all hover:scale-105">
              Access Platform
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-32 px-6 min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                <span className="text-sm font-semibold text-indigo-300 uppercase tracking-widest">System Operational v1.0</span>
            </div>
            
            {/* OAU Exclusivity Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-500 tracking-wide">Exclusively at Obafemi Awolowo University</span>
            </div>
          </MotionDiv>

          <MotionDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] text-white">
              The Operating System <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
                for Modern Academia.
              </span>
            </h1>
          </MotionDiv>

          <MotionDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              A unified digital ecosystem designed for forward-thinking institutions. 
              Currently powering academic coordination at <span className="text-white font-medium">OAU</span>.
            </p>
          </MotionDiv>

          <MotionDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/login')} 
              className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] transition-all hover:scale-105 border-0 ring-1 ring-white/10"
            >
              Explore Platform <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleInstallClick}
              className="h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 text-white"
            >
              <Download className="mr-2 h-5 w-5" /> Install App
            </Button>
          </MotionDiv>
        </div>
      </section>

      {/* --- Stats Strip --- */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active OAU Students', value: '15k+' },
              { label: 'Daily Sessions', value: '500+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Faculties', value: '13+' },
            ].map((stat, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* --- Visual Gallery (New Section) --- */}
      <section id="gallery" className="py-32 bg-gradient-to-b from-[#020617] to-[#0f172a] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for Experience</h2>
           <p className="text-zinc-400 max-w-2xl mx-auto text-lg">A native-grade interface that feels natural on any device. Dark mode by default.</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20 relative px-6">
           {/* Background Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

           {/* Phone 1: Dashboard */}
           <div className="relative z-10 transform lg:translate-y-12">
              <PhoneFrame>
                 <div className="p-5 pt-12 flex flex-col h-full bg-[#09090b]">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                          <div className="text-xs text-zinc-500 uppercase">OAU Student</div>
                          <div className="text-xl font-bold text-white">Dashboard</div>
                       </div>
                       <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500" />
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/20">
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