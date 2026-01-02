
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { QrCode, Wifi } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="p-10 text-center animate-pulse">Loading ID...</div>;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Digital Student ID</h2>
        <p className="text-muted-foreground">Use this for verification during physical exams or classes.</p>
      </div>

      <MotionDiv
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative w-full max-w-md perspective-1000"
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-900 to-black shadow-2xl relative h-[600px] rounded-3xl">
          {/* Holographic Overlay Effect */}
          <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-30 pointer-events-none mix-blend-overlay" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/30 blur-[80px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full" />

          <CardContent className="h-full flex flex-col items-center p-8 relative z-10">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/40">N</div>
                 <span className="font-bold tracking-widest text-lg">NEXUS</span>
              </div>
              <Wifi className="h-6 w-6 text-white/50" />
            </div>

            {/* Avatar */}
            <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-primary to-cyan-400 mb-6 shadow-xl">
              <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-4xl font-bold text-white">
                {profile.name.charAt(0)}
              </div>
            </div>

            {/* Info */}
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
              <p className="text-cyan-400 font-mono text-lg tracking-wider">{profile.regNo}</p>
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/5 mt-2">
                {profile.department} • Level {profile.level}
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="mt-auto bg-white p-2 rounded-xl">
               <QrCode className="h-24 w-24 text-black" />
            </div>
            <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">Scan to Verify</p>

          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
