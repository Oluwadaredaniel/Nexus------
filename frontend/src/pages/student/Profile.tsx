
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { Wifi, BookOpen, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';

const MotionDiv = motion.div as any;

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, histRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/attendance/history')
        ]);
        setProfile(meRes.data);
        setHistory(histRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading || !profile) return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading Profile...</div>;

  const totalAttended = history.filter(h => h.status === 'present').length;
  // Calculate attendance this month
  const currentMonth = new Date().getMonth();
  const monthAttended = history.filter(h => new Date(h.markedAt).getMonth() === currentMonth && h.status === 'present').length;
  
  const lastClass = history.length > 0 ? history[0] : null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Student Profile</h2>
        <p className="text-muted-foreground">Personal metrics and academic identity.</p>
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
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-cyan-400 mb-6 shadow-xl">
              <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-4xl font-bold text-white">
                {profile.name.charAt(0)}
              </div>
            </div>

            {/* Info */}
            <div className="text-center space-y-2 mb-8 w-full">
              <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
              <p className="text-cyan-400 font-mono text-lg tracking-wider">{profile.regNo}</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/5">
                  {profile.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/5">
                  Lvl {profile.level}
                </span>
              </div>
              {profile.option && (
                 <div className="text-xs text-muted-foreground mt-1">
                   Track: {profile.option}
                 </div>
              )}
            </div>

            {/* Metrics Section (Replaces QR) */}
            <div className="mt-auto w-full grid grid-cols-2 gap-3">
               <div className="p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <BookOpen className="h-3 w-3" /> Total Classes
                  </div>
                  <div className="text-xl font-bold text-white">{totalAttended}</div>
               </div>
               <div className="p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" /> This Month
                  </div>
                  <div className="text-xl font-bold text-emerald-400">{monthAttended}</div>
               </div>
               <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" /> Last Active
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {lastClass ? (
                      <>
                        {lastClass.session?.course?.code} • {formatDate(lastClass.markedAt)}
                      </>
                    ) : 'No activity yet'}
                  </div>
               </div>
            </div>

          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}