
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Wifi, MapPin, CheckCircle2, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const socket = io('http://localhost:5000');
const MotionDiv = motion.div as any;

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for the chart since we don't have a real endpoint for "overall attendance stats" yet
  // In production, this would come from an API
  const [attendanceStats] = useState([
    { name: 'Present', count: 85, fill: '#8b5cf6' },
    { name: 'Absent', count: 15, fill: '#3f3f46' },
  ]);

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 15000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/attendance/active');
      setActiveSessions(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAttendance = async (sessionId: string) => {
    try {
      await api.post(`/attendance/${sessionId}/mark`);
      toast.success('Attendance Marked Successfully!');
      socket.emit('attendance_marked', { sessionId, studentName: user?.name });
      fetchActiveSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-1">
            Hello, <span className="text-gradient-primary">{user?.name.split(' ')[0]}</span>
          </h2>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{user?.regNo}</span>
            <span>{user?.department}</span>
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-3xl font-bold text-white">85%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
        
        {/* Main: Active Sessions */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Active Now
            </h3>
          </div>

          {activeSessions.length === 0 && !loading && (
            <motion.div variants={item} className="p-8 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No live classes currently.</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">Check back later or enable notifications for updates.</p>
            </motion.div>
          )}

          {activeSessions.map((session) => (
            <motion.div variants={item} key={session._id}>
              <Card className="border-0 bg-gradient-to-br from-[#8b5cf6]/20 to-black border-l-4 border-l-[#8b5cf6] overflow-hidden relative shadow-2xl group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#8b5cf6]/20 blur-[60px] rounded-full group-hover:bg-[#8b5cf6]/30 transition-colors" />
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="px-2 py-1 rounded bg-[#8b5cf6]/20 text-[#c4b5fd] text-[10px] font-bold inline-block mb-2 border border-[#8b5cf6]/20">
                        {session.course.code}
                      </div>
                      <h4 className="text-xl md:text-2xl font-bold text-white leading-tight">{session.course.title}</h4>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                      <Wifi className="h-5 w-5 text-[#8b5cf6] animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 p-2 rounded-lg">
                       <Clock className="h-4 w-4 text-[#8b5cf6]" />
                       <span className="font-mono text-xs">{new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 p-2 rounded-lg">
                       <MapPin className="h-4 w-4 text-[#8b5cf6]" />
                       <span className="text-xs">Physical Hall</span>
                     </div>
                  </div>

                  <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-[#8b5cf6]/20 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-0 transition-all hover:translate-y-[-2px]" onClick={() => markAttendance(session._id)}>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Mark Present
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <motion.div variants={item}>
            <Card className="glass-card h-full min-h-[300px] flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative">
                <h4 className="absolute top-6 left-6 font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Monthly Activity
                </h4>
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="70%" 
                      outerRadius="100%" 
                      barSize={10} 
                      data={attendanceStats} 
                      startAngle={180} 
                      endAngle={0}
                    >
                      <RadialBar
                        background
                        dataKey="count"
                        cornerRadius={10}
                        label={false}
                      />
                      <Legend 
                        iconSize={8} 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={false}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-[-40px]">
                  <span className="text-3xl font-bold text-white">85%</span>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-black border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Next Week</h4>
                  <p className="text-[10px] text-muted-foreground">Upcoming Schedule</p>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                 <div className="flex justify-between text-xs p-2 rounded bg-white/5">
                   <span className="text-white">CSC 301</span>
                   <span className="text-muted-foreground">Mon, 9:00 AM</span>
                 </div>
                 <div className="flex justify-between text-xs p-2 rounded bg-white/5">
                   <span className="text-white">GNS 202</span>
                   <span className="text-muted-foreground">Tue, 2:00 PM</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
