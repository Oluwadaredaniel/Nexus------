
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, BookOpen, UserCheck, Activity, ArrowUpRight, GraduationCap, Building2, Layers, ShieldCheck, Trash2, Settings, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const MotionDiv = motion.div as any;

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loginMode, setLoginMode] = useState('BOTH');
  const [savingConfig, setSavingConfig] = useState(false);

  const trendData = [
    { name: 'Mon', count: 420 },
    { name: 'Tue', count: 350 },
    { name: 'Wed', count: 550 },
    { name: 'Thu', count: 480 },
    { name: 'Fri', count: 200 },
  ];

  useEffect(() => {
    fetchData();
    fetchConfig();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes] = await Promise.all([
        api.get('/admin/analytics')
      ]);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/settings');
      setLoginMode(res.data.loginMode);
    } catch(e) {}
  };

  const updateLoginMode = async (mode: string) => {
    setSavingConfig(true);
    setLoginMode(mode); // Optimistic UI
    try {
      await api.put('/admin/settings', { loginMode: mode });
      toast.success(`Login restricted to: ${mode}`);
    } catch(e) {
      toast.error('Failed to update config');
    } finally {
      setSavingConfig(false);
    }
  };

  if (!stats) return <div className="flex h-96 items-center justify-center text-primary animate-pulse text-sm font-mono tracking-widest">INITIALIZING SYSTEM...</div>;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <MotionDiv variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">System Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">Real-time telemetry across the university.</p>
        </div>
      </div>
      
      {/* Detailed Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Faculties" 
          value={stats.totalFaculties || 0} 
          icon={Building2} 
          color="text-blue-400" 
        />
        <StatCard 
          title="Departments" 
          value={stats.totalDepartments || 0} 
          icon={Layers} 
          color="text-indigo-400" 
        />
        <StatCard 
          title="Active Class Reps" 
          value={stats.totalReps || 0} 
          icon={ShieldCheck} 
          color="text-amber-400" 
        />
        <StatCard 
          title="Registered Students" 
          value={stats.totalStudents || 0} 
          icon={Users} 
          color="text-emerald-400" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Login Config Card */}
        <Card className="glass-card md:col-span-1 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" /> Authentication Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-xs text-muted-foreground">
               Control how students access the portal. New users can always use RegNo.
             </div>
             <div className="grid grid-cols-1 gap-2">
               <button 
                 onClick={() => updateLoginMode('BOTH')}
                 className={`p-3 rounded-lg text-xs font-bold text-left transition-all border ${loginMode === 'BOTH' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5'}`}
               >
                 Allow Both (Recommended)
               </button>
               <button 
                 onClick={() => updateLoginMode('REG_ONLY')}
                 className={`p-3 rounded-lg text-xs font-bold text-left transition-all border ${loginMode === 'REG_ONLY' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5'}`}
               >
                 Reg Number Only
               </button>
               <button 
                 onClick={() => updateLoginMode('MATRIC_ONLY')}
                 className={`p-3 rounded-lg text-xs font-bold text-left transition-all border ${loginMode === 'MATRIC_ONLY' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5'}`}
               >
                 Matric Number Only
               </button>
             </div>
          </CardContent>
        </Card>

        {/* Live Feed */}
        <MotionDiv variants={item} className="col-span-2 glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Live Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {stats.recentActivity.map((act: any, i: number) => {
                 const hasProfile = !!act.student;
                 const displayName = hasProfile ? act.student.name : 'Deleted Account';
                 return (
                   <MotionDiv 
                     key={act._id} 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-center gap-4 group"
                   >
                     <div className={`h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-white transition-colors shadow-lg ${hasProfile ? 'bg-gradient-to-tr from-zinc-800 to-zinc-900 group-hover:border-primary/50' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                       {hasProfile ? displayName.charAt(0) : <Trash2 className="h-4 w-4" />}
                     </div>
                     <div className="flex-1 space-y-1">
                       <p className={`text-sm font-medium leading-none transition-colors ${hasProfile ? 'text-white group-hover:text-primary' : 'text-zinc-500 italic'}`}>
                         {displayName}
                       </p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                         {act.regNo}
                       </p>
                     </div>
                     <div className="font-mono text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                       {new Date(act.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </div>
                   </MotionDiv>
                 );
               })}
               {stats.recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">Waiting for live data...</p>}
             </div>
          </CardContent>
        </MotionDiv>
      </div>
    </MotionDiv>
  );
}

function StatCard({ title, value, icon: Icon, color = "text-zinc-500" }: any) {
  return (
    <MotionDiv variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
      <Card className="glass-card border-white/5 hover:bg-white/5 transition-colors group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}