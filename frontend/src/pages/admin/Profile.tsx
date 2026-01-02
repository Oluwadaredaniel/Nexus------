
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, User, Calendar, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function AdminProfile() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fetch some admin specific stats if needed
    const fetchStats = async () => {
       try {
         const res = await api.get('/admin/analytics');
         setStats(res.data);
       } catch(e) {}
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
           <p className="text-muted-foreground">System Administrator Credentials</p>
        </div>
      </div>

      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
        {/* ID Card Style */}
        <Card className="md:col-span-1 border-0 bg-gradient-to-br from-red-900/40 to-black border-l-4 border-l-red-500 relative overflow-hidden shadow-xl h-fit">
           <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-3xl font-bold text-red-500 border border-red-500/30">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-red-400 text-sm font-medium tracking-wider mt-1">SUPER ADMIN</p>
              <div className="mt-6 w-full pt-6 border-t border-white/10 space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">ID</span>
                   <span className="font-mono text-white">{user.regNo}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Access</span>
                   <span className="text-green-400">Full System</span>
                 </div>
              </div>
           </CardContent>
           <div className="absolute top-0 right-0 p-32 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />
        </Card>

        {/* Details & Stats */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid sm:grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                   <User className="h-4 w-4" /> Full Name
                 </div>
                 <div className="font-medium text-lg">{user.name}</div>
               </div>
               <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                   <Hash className="h-4 w-4" /> Admin ID
                 </div>
                 <div className="font-mono text-lg">{user.regNo}</div>
               </div>
               <div className="p-4 rounded-xl bg-white/5 border border-white/5 sm:col-span-2">
                 <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                   <Calendar className="h-4 w-4" /> Account Created
                 </div>
                 <div className="font-medium">System Bootstrap</div>
               </div>
             </div>

             {stats && (
               <div className="pt-6 border-t border-white/5">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">System Responsibility</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
                      <div className="text-xs text-muted-foreground">Courses</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-white">{stats.totalAttendance}</div>
                      <div className="text-xs text-muted-foreground">Records</div>
                    </div>
                  </div>
               </div>
             )}
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
