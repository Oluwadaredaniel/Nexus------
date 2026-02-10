
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StopCircle, Wifi, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function SessionManagement() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchSessions();
    const i = setInterval(fetchSessions, 10000);
    return () => clearInterval(i);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/admin/sessions');
      setSessions(res.data);
    } catch (e) { console.error(e); }
  };

  const forceEnd = async (id: string) => {
    if (!window.confirm('Force end this session?')) return;
    try {
      await api.put(`/admin/sessions/${id}/end`);
      toast.success('Session ended');
      fetchSessions();
    } catch (e) { toast.error('Failed to end session'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Global Session Monitor</h2>
          <p className="text-muted-foreground">Live view of all active classes across the university.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
          <Wifi className="h-3 w-3" /> Live Monitor
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((s) => (
          <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={s._id}>
            <Card className="glass-card border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-xs font-bold text-primary mb-1">
                    {s.course?.code || 'GENERAL'}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {s.course?.title || s.title}
                  </h3>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                   <div className="flex justify-between">
                     <span>Rep:</span>
                     <span className="text-white">{s.createdBy?.name || 'Unknown'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Dept:</span>
                     <span className="text-white">{s.department} ({s.level})</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Ends:</span>
                     <span className="text-white">{new Date(s.endTime).toLocaleTimeString()}</span>
                   </div>
                </div>

                <Button variant="destructive" size="sm" className="w-full" onClick={() => forceEnd(s._id)}>
                  <StopCircle className="h-4 w-4 mr-2" /> Force End
                </Button>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
            No active sessions currently running.
          </div>
        )}
      </div>
    </div>
  );
}