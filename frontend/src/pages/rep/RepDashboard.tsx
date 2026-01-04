
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Wifi, GraduationCap, Play, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function RepDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/rep/stats');
        setStats(res.data);
      } catch(e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const onboardingRate = stats ? Math.round((stats.totalRegistered / stats.totalList) * 100) || 0 : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rep Overview</h2>
          <p className="text-muted-foreground">{user?.department} — Level {user?.level}</p>
        </div>
        <Button onClick={() => navigate('/rep/create-session')} className="h-12 px-6 shadow-lg shadow-primary/20">
           <Play className="mr-2 h-5 w-5" /> Start Session
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        
        {/* Analytics Card */}
        <Card className="glass-card md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Cohort Analytics
            </CardTitle>
            <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">{user?.option || 'General'}</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
               <div>
                 <div className="text-3xl font-bold text-white">{stats ? stats.totalList : '-'}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Expected Students</div>
               </div>
               <div className="h-10 w-px bg-white/10" />
               <div>
                 <div className="text-3xl font-bold text-emerald-400">{stats ? stats.totalRegistered : '-'}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Signed Up</div>
               </div>
               <div className="ml-auto text-right">
                 <div className="text-xl font-bold text-primary">{onboardingRate}%</div>
                 <div className="text-xs text-muted-foreground">Onboarding</div>
               </div>
            </div>
            <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <MotionDiv 
                 initial={{ width: 0 }} 
                 animate={{ width: `${onboardingRate}%` }} 
                 className="h-full bg-primary"
               />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Status */}
        <div className="grid gap-4">
          <Card className="glass-card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/rep/students')}>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Class List Management</CardTitle>
               <UserCheck className="h-4 w-4 text-blue-400" />
             </CardHeader>
             <CardContent>
               <div className="text-lg font-bold text-white mb-1">Manage Students</div>
               <p className="text-xs text-zinc-500">Add or Edit student entries</p>
             </CardContent>
          </Card>

          <Card className="glass-card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/history')}>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">My Attendance</CardTitle>
               <GraduationCap className="h-4 w-4 text-purple-500" />
             </CardHeader>
             <CardContent>
               <div className="text-lg font-bold text-white">View History</div>
             </CardContent>
          </Card>
        </div>
      </div>
      
      {stats && stats.totalRegistered < stats.totalList && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
           <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
           <div className="space-y-1">
             <h4 className="text-sm font-medium text-yellow-500">Pending Signups</h4>
             <p className="text-xs text-yellow-200/60 leading-relaxed">
               There are {stats.totalList - stats.totalRegistered} students in your list who haven't created an account yet. 
               Remind them to sign up using their Reg No to appear in attendance reports.
             </p>
           </div>
        </div>
      )}
    </div>
  );
}
