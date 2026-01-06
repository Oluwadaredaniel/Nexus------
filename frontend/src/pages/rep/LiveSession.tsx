
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { io } from 'socket.io-client';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Wifi, StopCircle, ArrowLeft, Users, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const socket = io('/', { path: '/socket.io' }); 

export default function LiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Audio for check-in sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSessionData();
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    // Socket Connection
    socket.emit('join_session', id);

    socket.on('update_attendees', (payload) => {
      // Play sound
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }

      // Add to list with animation
      setAttendees((prev) => {
        // Prevent duplicates in case of network retry
        if (prev.find(a => a.regNo === payload.student.regNo)) return prev;
        
        const newRecord = {
          _id: Math.random().toString(), // Temp ID for list key
          student: payload.student,
          markedAt: new Date().toISOString(),
          status: 'present',
          isNew: true // Flag for animation
        };
        return [newRecord, ...prev];
      });
    });

    return () => {
      socket.off('update_attendees');
      socket.emit('leave_session', id);
    };
  }, [id]);

  const fetchSessionData = async () => {
    try {
      const [sessRes, attRes] = await Promise.all([
        api.get('/rep/sessions'), // Get all to find specific one
        api.get(`/attendance/session/${id}/attendees`)
      ]);
      
      const foundSession = sessRes.data.find((s: any) => s._id === id);
      setSession(foundSession);
      // Reverse to show newest first
      setAttendees(attRes.data.reverse());
    } catch (e) {
      toast.error('Failed to load session data');
      navigate('/rep/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if(!window.confirm('Are you sure you want to end this session? Students will no longer be able to mark attendance.')) return;
    try {
      await api.put(`/rep/sessions/${id}/end`);
      toast.success('Session Closed Successfully');
      navigate('/rep/sessions');
    } catch(e) { toast.error('Failed to end session'); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse text-primary font-mono tracking-widest">CONNECTING TO SATELLITE...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#020617] pb-10">
      {/* Header / Stats Bar */}
      <div className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/rep/sessions')} className="rounded-full hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  {session.course.code}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </h1>
                <p className="text-zinc-400 text-sm">{session.course.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
               <div className="text-right">
                 <div className="text-3xl font-bold text-white tabular-nums">{attendees.length}</div>
                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Present</div>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <Button variant="destructive" onClick={handleEndSession} className="shadow-lg shadow-red-500/20 hover:bg-red-600">
                 <StopCircle className="mr-2 h-4 w-4" /> End Session
               </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="glass-card bg-indigo-500/10 border-indigo-500/20">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Session Code</div>
               <div className="text-2xl font-mono font-bold text-white tracking-widest">{session.uniqueCode}</div>
             </CardContent>
           </Card>
           
           <Card className="glass-card">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Time Remaining</div>
               <div className="text-xl font-bold text-white">
                 {Math.max(0, Math.floor((new Date(session.endTime).getTime() - Date.now()) / 60000))} min
               </div>
             </CardContent>
           </Card>

           <Card className="glass-card">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Type</div>
               <div className="text-sm font-bold text-white flex items-center gap-2">
                 <Wifi className="h-3 w-3 text-emerald-500" /> Geo-Fenced
               </div>
             </CardContent>
           </Card>

           <Card className="glass-card">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Target</div>
               <div className="text-sm font-bold text-white truncate w-full">
                 {session.option || session.department}
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Live Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" /> Live Check-ins
          </h2>
          
          <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden min-h-[400px]">
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-black/20">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-3">Reg No</div>
              <div className="col-span-4">Student Name</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {attendees.map((record, i) => (
                  <MotionDiv
                    key={record._id} 
                    initial={{ opacity: 0, x: -20, backgroundColor: "rgba(99, 102, 241, 0.2)" }}
                    animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
                  >
                    <div className="col-span-1 text-center text-zinc-600 font-mono text-xs">{attendees.length - i}</div>
                    <div className="col-span-2 text-zinc-400 text-xs font-mono">
                      {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="col-span-3 text-white font-mono text-sm">{record.student.regNo}</div>
                    <div className="col-span-4 text-white font-medium flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                        {record.student.name.charAt(0)}
                      </div>
                      <span className="truncate">{record.student.name}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                  </MotionDiv>
                ))}
              </AnimatePresence>
              {attendees.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                    <Wifi className="h-8 w-8 opacity-50" />
                  </div>
                  <p>Waiting for students to join...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
