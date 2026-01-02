
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Play, StopCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const socket = io(); // Proxy handles URL

export default function RepDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [selCourse, setSelCourse] = useState('');
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    api.get('/admin/courses').then(res => setCourses(res.data));
    api.get('/rep/sessions').then(res => {
      const active = res.data.find((s: any) => s.isActive);
      if (active) { setActiveSession(active); joinSocket(active._id); }
    });
  }, []);

  const joinSocket = (id: string) => {
    socket.emit('join_session', id);
    socket.on('update_attendees', ({ studentName }) => {
      setAttendees(prev => [...prev, studentName]);
      toast.success(`${studentName} joined`);
    });
  };

  const startSession = async () => {
    try {
      const res = await api.post('/rep/sessions', { courseId: selCourse, durationMinutes: duration });
      setActiveSession(res.data);
      joinSocket(res.data._id);
    } catch (e) { toast.error('Failed to start'); }
  };

  const endSession = async () => {
    await api.put(`/rep/sessions/${activeSession._id}/end`);
    setActiveSession(null);
    setAttendees([]);
    socket.off('update_attendees');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Session Manager</h2>
      {!activeSession ? (
        <div className="glass-card p-8 rounded-3xl space-y-4 max-w-xl">
          <h3 className="text-xl font-bold text-white">Start New Session</h3>
          <select onChange={e => setSelCourse(e.target.value)} className="w-full p-3 bg-black/20 rounded-xl text-zinc-300 border border-white/10">
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
          <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full p-3 bg-black/20 rounded-xl text-zinc-300 border border-white/10" />
          <button onClick={startSession} className="w-full py-3 bg-primary rounded-xl font-bold text-white flex items-center justify-center gap-2">
            <Play size={18} /> Start Session
          </button>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 animate-pulse"><div className="h-3 w-3 bg-red-500 rounded-full" /></div>
          <div className="text-center mb-8">
            <p className="text-zinc-400 uppercase tracking-widest text-sm">Session Code</p>
            <h1 className="text-7xl font-mono font-bold text-white tracking-widest my-4">{activeSession.uniqueCode}</h1>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold flex items-center gap-2"><Users /> Live Attendees ({attendees.length})</h4>
            <button onClick={endSession} className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg flex items-center gap-2 hover:bg-red-500/30">
              <StopCircle size={16} /> End Session
            </button>
          </div>
          <div className="h-48 overflow-y-auto bg-black/20 rounded-xl p-2 space-y-1">
            {attendees.map((a, i) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="p-2 bg-white/5 rounded text-sm text-zinc-300">
                {a}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
