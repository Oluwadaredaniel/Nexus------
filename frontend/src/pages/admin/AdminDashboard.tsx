
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, BookOpen, UserCheck, Activity, ArrowUpRight, GraduationCap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const MotionDiv = motion.div as any;

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [myHistory, setMyHistory] = useState<any[]>([]);

  // Mock data for chart - in production calculate from actual attendance
  const trendData = [
    { name: 'Mon', count: 420 },
    { name: 'Tue', count: 350 },
    { name: 'Wed', count: 550 },
    { name: 'Thu', count: 480 },
    { name: 'Fri', count: 200 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/attendance/history')
        ]);
        setStats(statsRes.data);
        setMyHistory(historyRes.data);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="flex h-96 items-center justify-center text-primary animate-pulse text-sm font-mono tracking-widest">INITIALIZING SYSTEM...</div>;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const myAttendanceCount = myHistory.filter(h => h.status === 'present').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">System Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">Real-time telemetry across the university.</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">My Personal Stats</div>
           <div className="flex items-center justify-end gap-2 text-white">
             <GraduationCap className="h-4 w-4 text-primary" />
             <span className="font-bold">{myAttendanceCount}</span> Sessions Attended
           </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} change="+12%" />
        <StatCard title="Active Courses" value={stats.totalCourses} icon={BookOpen} change="+4" />
        <StatCard title="Total Attendance" value={stats.totalAttendance} icon={UserCheck} change="+854" />
        <StatCard title="System Health" value="99.9%" icon={Activity} change="Stable" />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <MotionDiv variants={item} className="col-span-4 glass-card p-1 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white flex justify-between">
              Attendance Trends
              <select className="bg-transparent text-xs text-muted-foreground border-none outline-none cursor-pointer">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </MotionDiv>

        <MotionDiv variants={item} className="col-span-3 glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Live Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {stats.recentActivity.map((act: any, i: number) => (
                 <motion.div 
                   key={act._id} 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-center gap-4 group"
                 >
                   <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-primary/50 transition-colors shadow-lg">
                     {act.student.name.charAt(0)}
                   </div>
                   <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium leading-none text-white group-hover:text-primary transition-colors">{act.student.name}</p>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{act.student.regNo}</p>
                   </div>
                   <div className="font-mono text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                     {new Date(act.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
                 </motion.div>
               ))}
               {stats.recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">Waiting for live data...</p>}
             </div>
          </CardContent>
        </MotionDiv>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, change }: any) {
  return (
    <MotionDiv variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
      <Card className="glass-card border-white/5 hover:bg-white/5 transition-colors group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
          <Icon className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> {change}</span> from last week
          </p>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
