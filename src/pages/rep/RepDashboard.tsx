import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Clock, Users, Download, Play, StopCircle } from 'lucide-react';

const socket = io('http://localhost:5000'); // Adjust for prod

const MotionDiv = motion.div as any;

export default function RepDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState(60);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [liveAttendees, setLiveAttendees] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSession) {
      socket.emit('join_session', activeSession._id);
      socket.on('update_attendees', ({ studentName }) => {
        setLiveAttendees(prev => [studentName, ...prev]);
        toast.success(`${studentName} marked present!`, { icon: '🎓' });
      });
    }
    return () => { socket.off('update_attendees'); };
  }, [activeSession]);

  const fetchCourses = async () => {
    const res = await api.get('/admin/courses');
    setCourses(res.data);
  };

  const fetchSessions = async () => {
    const res = await api.get('/rep/sessions');
    setSessions(res.data);
    const active = res.data.find((s: any) => s.isActive);
    if (active) setActiveSession(active);
  };

  const createSession = async () => {
    if (!selectedCourse) return toast.error('Select a course');
    try {
      const res = await api.post('/rep/sessions', {
        courseId: selectedCourse,
        durationMinutes: duration
      });
      setActiveSession(res.data);
      setSessions([res.data, ...sessions]);
      toast.success('Session Started Successfully!');
    } catch (e) { toast.error('Failed to start session'); }
  };

  const endSession = async (id: string) => {
    try {
      await api.put(`/rep/sessions/${id}/end`);
      setActiveSession(null);
      fetchSessions();
      toast.success('Session Ended');
    } catch (e) { toast.error('Error ending session'); }
  };

  const exportData = async (sessionId: string, format: 'xlsx' | 'pdf') => {
    try {
      const res = await api.get(`/attendance/session/${sessionId}/attendees`);
      const data = res.data.map((r: any) => ({
        RegNo: r.regNo,
        Name: r.student.name,
        Time: formatDate(r.markedAt),
        Status: r.status
      }));

      if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
        saveAs(blob, `attendance_${sessionId}.xlsx`);
      } else {
        const doc = new jsPDF();
        (doc as any).autoTable({
          head: [['Reg No', 'Name', 'Time', 'Status']],
          body: data.map((row: any) => [row.RegNo, row.Name, row.Time, row.Status]),
        });
        doc.save(`attendance_${sessionId}.pdf`);
      }
    } catch (e) { toast.error('Export failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class Rep Dashboard</h2>
          <p className="text-muted-foreground">{user?.department} — Level {user?.level}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
          <Wifi className="h-3 w-3" /> System Online
        </div>
      </div>

      <AnimatePresence>
        {activeSession ? (
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wifi className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle className="flex justify-between items-center relative z-10">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Live Session: {activeSession.course.code}
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => endSession(activeSession._id)}>
                    <StopCircle className="mr-2 h-4 w-4" /> End Session
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Session Code</p>
                    <h3 className="text-6xl font-black tracking-widest text-white font-mono">{activeSession.uniqueCode}</h3>
                    <p className="text-xs text-muted-foreground mt-4">Display this code to students</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Live Attendees</h4>
                      <span className="px-2 py-0.5 rounded bg-primary text-white text-xs font-bold">{liveAttendees.length}</span>
                    </div>
                    <div className="h-48 overflow-y-auto bg-black/20 rounded-xl border border-white/5 p-2 space-y-1 scrollbar-hide">
                      <AnimatePresence>
                        {liveAttendees.map((name, i) => (
                          <MotionDiv 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i} 
                            className="text-sm px-3 py-2 rounded bg-white/5 border border-white/5 flex items-center justify-between"
                          >
                            {name}
                            <span className="text-[10px] text-green-400">Just now</span>
                          </MotionDiv>
                        ))}
                      </AnimatePresence>
                      {liveAttendees.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">Waiting for students...</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ) : (
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-primary" /> Start New Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/2 space-y-2">
                  <label className="text-sm font-medium ml-1">Select Course</label>
                  <select 
                    className="w-full p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
                  </select>
                </div>
                <div className="w-full md:w-1/4 space-y-2">
                  <label className="text-sm font-medium ml-1">Duration (Min)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={duration} 
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full p-2.5 pl-9 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button className="w-full md:w-auto h-[42px] min-w-[140px]" onClick={createSession}>
                  Start Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5" /> Recent History</h3>
        <div className="grid gap-4">
          {sessions.map((s, i) => (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={s._id}>
              <Card className="glass-card border-white/5 hover:bg-white/5 transition-colors">
                <CardContent className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                      {s.course.code.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{s.course.code} <span className="font-normal text-muted-foreground text-sm">- {s.course.title}</span></div>
                      <div className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 border-white/10" onClick={() => exportData(s._id, 'xlsx')}>
                      <Download className="h-3 w-3 mr-1" /> Excel
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-white/10" onClick={() => exportData(s._id, 'pdf')}>
                      <Download className="h-3 w-3 mr-1" /> PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </div>
  );
}