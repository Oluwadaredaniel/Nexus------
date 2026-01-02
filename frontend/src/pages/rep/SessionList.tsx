
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import SessionCard from '../../components/shared/SessionCard';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SessionList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/rep/sessions');
      setSessions(res.data);
    } catch (e) { toast.error('Failed to load sessions'); }
  };

  const handleEndSession = async (id: string) => {
    if(!window.confirm('End this session now?')) return;
    try {
      await api.put(`/rep/sessions/${id}/end`);
      toast.success('Session ended');
      fetchSessions();
    } catch(e) { toast.error('Failed to end'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Sessions</h2>
          <p className="text-muted-foreground">Active and past classes.</p>
        </div>
        <Button onClick={() => navigate('/rep/create-session')}>
          <Plus className="mr-2 h-4 w-4" /> Start New
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(s => (
          <SessionCard 
            key={s._id} 
            session={s} 
            role="rep" 
            onAction={s.isActive ? handleEndSession : undefined}
          />
        ))}
        {sessions.length === 0 && <p className="text-muted-foreground col-span-full text-center py-10">No sessions found.</p>}
      </div>
    </div>
  );
}
