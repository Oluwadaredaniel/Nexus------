
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Wifi, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export default function MarkAttendance() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/attendance/active');
      setSessions(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const mark = async (id: string) => {
    try {
      await api.post(`/attendance/${id}/mark`);
      toast.success('Marked Successfully!');
      fetchSessions();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <div>
           <h2 className="text-3xl font-bold tracking-tight text-white">Mark Attendance</h2>
           <p className="text-muted-foreground">Showing sessions for {user?.department} - Level {user?.level}</p>
         </div>
      </div>

      {sessions.length === 0 && !loading && (
        <div className="p-12 border border-dashed border-white/10 rounded-2xl bg-white/5 text-center">
           <Wifi className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
           <p className="text-muted-foreground">No active sessions found for you right now.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(s => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={s._id}>
            <Card className="border-0 bg-gradient-to-br from-[#8b5cf6]/20 to-black border-l-4 border-l-[#8b5cf6] overflow-hidden relative shadow-xl">
               <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 rounded bg-[#8b5cf6]/20 text-[#c4b5fd] text-xs font-bold border border-[#8b5cf6]/20">
                      {s.course.code}
                    </span>
                    <Wifi className="h-5 w-5 text-[#8b5cf6] animate-pulse" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-6 leading-tight">{s.course.title}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-400 mb-6">
                     <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4" />
                       <span>Ends: {new Date(s.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <MapPin className="h-4 w-4" />
                       <span>Physical Session</span>
                     </div>
                  </div>

                  <Button className="w-full h-12 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold" onClick={() => mark(s._id)}>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> I am Here
                  </Button>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
