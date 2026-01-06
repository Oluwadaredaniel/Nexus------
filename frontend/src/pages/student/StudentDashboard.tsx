
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

const socket = io('/', { path: '/socket.io' });
const MotionDiv = motion.div as any;

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchActiveSessions, 15000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchActiveSessions(), fetchHistory()]);
    setLoading(false);
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/attendance/active');
      setActiveSessions(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/attendance/history');
      setHistory(res.data);
    } catch(e) { console.error(e); }
  };

  const markAttendance = async (sessionId: string) => {
    try {
      await api.post(`/attendance/${sessionId}/mark`);
      toast.success('Attendance Marked Successfully!');
      
      // Emit full details to socket for the Live Monitor
      socket.emit('attendance_marked', { 
        sessionId, 
        student: {
          name: user?.name,
          regNo: user?.regNo,
          _id: user?._id
        }
      });
      
      fetchActiveSessions();
      fetchHistory(); // Refresh stats
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark');
    }
  };

  // Calculate stats for Radial Chart
  const totalClasses = 50; // Mock total expected classes for demo, or derive if data available
  const presentCount = history.filter(h => h.status === 'present').length;
  const attendanceRate = Math.min(100, Math.round((presentCount / (presentCount + 5)) * 100)); // Simple heuristic for demo

  const chartData = [
    { name: 'Total', count: 100, fill: '#27272a' }, // Background ring
    { name: 'Present', count: attendanceRate, fill: '#8b5cf6' }
  ];

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
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-1">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name.split(' ')[0]}</span>
          </h2>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{user?.regNo}</span>
            <span>{user?.department}</span>
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-3xl font-bold text-white">{attendanceRate}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
        </div>
      </div>

      <MotionDiv variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
        
        {/* Main Column: Active Sessions */}
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
            <MotionDiv variants={item} className="p-8 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No live classes currently.</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">Check back later or enable notifications for updates.</p>
            </MotionDiv>
          )}

          {activeSessions.map((session) => (
            <MotionDiv variants={item} key={session._id}>
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
                     <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 p-2 rounded-lg border border-white/5">
                       <Clock className="h-4 w-4 text-[#8b5cf6]" />
                       <span className="font-mono text-xs">Ends {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 p-2 rounded-lg border border-white/5">
                       <MapPin className="h-4 w-4 text-[#8b5cf6]" />
                       <span className="text-xs">Physical Hall</span>
                     </div>
                  </div>

                  <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-[#8b5cf6]/20 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-0 transition-all hover:translate-y-[-2px]" onClick={() => markAttendance(session._id)}>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Mark Present
                  </Button>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <MotionDiv variants={item}>
            <Card className="glass-card h-full min-h-[300px] flex flex-col overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative z-10">
                <h4 className="w-full text-left font-semibold text-sm flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" /> Monthly Metrics
                </h4>
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="60%" 
                      outerRadius="100%" 
                      barSize={12} 
                      data={chartData} 
                      startAngle={90} 
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="count"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-4xl font-bold text-white">{attendanceRate}%</span>
                     <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Efficiency</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                   <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-white">{presentCount}</div>
                      <div className="text-[10px] text-zinc-500">Present</div>
                   </div>
                   <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-zinc-500">5</div>
                      <div className="text-[10px] text-zinc-500">Missed</div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          <MotionDiv variants={item}>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-black border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upcoming</h4>
                  <p className="text-[10px] text-muted-foreground">Scheduled Classes</p>
                </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                   <span className="text-white font-bold">CSC 301</span>
                   <span className="text-zinc-400">Mon, 9:00 AM</span>
                 </div>
                 <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                   <span className="text-white font-bold">GNS 202</span>
                   <span className="text-zinc-400">Tue, 2:00 PM</span>
                 </div>
              </div>
            </div>
          </MotionDiv>
        </div>

      </MotionDiv>
    </div>
  );
}
