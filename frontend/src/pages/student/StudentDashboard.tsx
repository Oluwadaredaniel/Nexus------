
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Wifi, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  
  const fetchSessions = () => api.get('/attendance/active').then(res => setSessions(res.data));
  useEffect(() => { fetchSessions(); const i = setInterval(fetchSessions, 10000); return () => clearInterval(i); }, []);

  const mark = async (id: string) => {
    try {
      await api.post(`/attendance/${id}/mark`);
      toast.success('Marked Present!');
      fetchSessions();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Active Sessions</h2>
      {sessions.length === 0 && <div className="text-zinc-500">No active sessions for your department/level.</div>}
      <div className="grid md:grid-cols-2 gap-6">
        {sessions.map(s => (
          <div key={s._id} className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/20">{s.course.code}</span>
                <Wifi className="text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">{s.course.title}</h3>
              <button onClick={() => mark(s._id)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Mark Attendance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
