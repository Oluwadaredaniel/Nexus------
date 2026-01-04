
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Radio, Calendar, Layers } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function RepProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, sessRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/rep/sessions')
        ]);
        setProfile(meRes.data);
        setSessions(sessRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading || !profile) return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading Profile...</div>;

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.isActive).length;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Class Rep Identity</h2>
        <p className="text-muted-foreground">Official verification for Class Representative duties.</p>
      </div>

      <MotionDiv
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative w-full max-w-md perspective-1000"
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-900/80 to-black shadow-2xl relative h-[600px] rounded-3xl border-t-4 border-amber-500">
          {/* Holographic Overlay Effect */}
          <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-30 pointer-events-none mix-blend-overlay" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-500/20 blur-[80px] rounded-full" />

          <CardContent className="h-full flex flex-col items-center p-8 relative z-10">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/40">N</div>
                 <span className="font-bold tracking-widest text-lg">NEXUS</span>
              </div>
              <ShieldCheck className="h-6 w-6 text-amber-500" />
            </div>

            {/* Avatar */}
            <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-yellow-300 mb-6 shadow-xl">
              <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center text-4xl font-bold text-white">
                {profile.name.charAt(0)}
              </div>
            </div>

            {/* Info */}
            <div className="text-center space-y-2 mb-8 w-full">
              <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
              
              <div className="flex flex-col items-center gap-1">
                <span className="text-amber-400 font-mono text-lg tracking-wider font-bold uppercase">
                  {profile.role?.replace('_', ' ')}
                </span>
                <span className="text-xs text-zinc-500 font-mono">{profile.regNo}</span>
              </div>

              <div className="flex flex-col items-center gap-2 mt-4 w-full">
                {/* Department Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 w-full justify-center">
                  <span className="text-zinc-300 text-sm font-medium">{profile.department}</span>
                </div>

                {/* Option Badge (Highlighted if exists) */}
                {profile.option && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 w-full justify-center">
                    <Layers className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-200 text-sm font-bold">{profile.option} Option</span>
                  </div>
                )}

                {/* Level Badge */}
                <div className="text-xs text-muted-foreground mt-1">
                  Level {profile.level} Cohort
                </div>
              </div>
            </div>

            {/* Rep Metrics */}
            <div className="mt-auto w-full space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center">
                    <Radio className="h-5 w-5 text-amber-500 mb-2" />
                    <span className="text-2xl font-bold text-white">{totalSessions}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Sessions</span>
                 </div>
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center">
                    <div className={`h-2 w-2 rounded-full mb-3 ${activeSessions > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-2xl font-bold text-white">{activeSessions}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Now</span>
                 </div>
               </div>
               
               <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                 <p className="text-xs text-amber-200/80">
                   {profile.role === 'dept_rep' 
                     ? `Authorized to manage sessions for the entire ${profile.department} department.`
                     : profile.option 
                       ? `Authorized to manage sessions for the ${profile.option} track.` 
                       : `Authorized to manage general ${profile.department} sessions.`
                   }
                 </p>
               </div>
            </div>

          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
