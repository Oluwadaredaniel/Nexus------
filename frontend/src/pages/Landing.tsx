
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Radio, Users, BarChart3 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center z-10 px-4">
        <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6 backdrop-blur-md">
          NEXUS v1.0 • Academic Suite
        </div>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6">
          Attendance, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Reinvented.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The centralized ecosystem for modern universities. Real-time session tracking, role-based management, and powerful analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/login')} className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
            Launch App <ChevronRight />
          </button>
          <button className="px-8 py-4 rounded-full border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-colors">
            Install PWA
          </button>
        </div>
      </motion.div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 px-4 max-w-6xl z-10">
        {[
          { icon: Radio, title: "Live Sessions", desc: "Geolocation & unique codes." },
          { icon: Users, title: "Role-Based", desc: "Student, Rep, and Admin flows." },
          { icon: BarChart3, title: "Analytics", desc: "Instant insights & reports." }
        ].map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.1) }} className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-lg hover:border-primary/30 transition-colors">
            <f.icon className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-zinc-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
