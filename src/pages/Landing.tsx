
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ChevronRight, Shield, Users, BarChart3, Radio, Download } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative flex flex-col">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg pointer-events-none z-0 opacity-50" />

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            NEXUS v1.0 Live
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-tight">
              Attendance, <br />
              <span className="text-gradient-primary">Reinvented.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              A centralized academic ecosystem for modern universities. 
              Real-time tracking, seamless management, and powerful analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 w-full px-4">
            <Button size="lg" onClick={() => navigate('/login')} className="h-14 w-full sm:w-auto px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              Launch App <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 w-full sm:w-auto px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm transition-transform hover:scale-105">
              <Download className="mr-2 h-5 w-5" /> Install PWA
            </Button>
          </div>
        </MotionDiv>

        {/* Floating Cards Animation Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl -z-10 opacity-30 pointer-events-none overflow-hidden">
           <div className="absolute top-1/4 left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-1/4 right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4 relative z-10 bg-black/40 backdrop-blur-md border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Radio}
            title="Live Sessions"
            desc="Real-time attendance tracking with geolocation and unique dynamic codes."
            delay={0.1}
          />
          <FeatureCard 
            icon={Users}
            title="Role-Based"
            desc="Dedicated dashboards for Students, Class Reps, and Super Admins."
            delay={0.2}
          />
          <FeatureCard 
            icon={BarChart3}
            title="Smart Analytics"
            desc="Instant insights into attendance rates, class participation, and trends."
            delay={0.3}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-white/5 bg-black">
        <p>© 2024 NEXUS Academic Suite. Built for Institutions.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: any) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-8 rounded-3xl glass-card flex flex-col items-center text-center md:items-start md:text-left hover:bg-white/5 transition-colors"
    >
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 ring-1 ring-primary/20">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
    </MotionDiv>
  )
}
