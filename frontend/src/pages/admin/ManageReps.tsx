
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowDownCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManageReps() {
  const [reps, setReps] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchReps(); }, []);

  const fetchReps = async () => {
    try {
      const res = await api.get('/admin/reps');
      setReps(res.data);
    } catch (e) { toast.error('Failed to load reps'); }
  };

  const handleDemote = async (id: string) => {
    if (!window.confirm('Demote this user back to Student role?')) return;
    try {
      await api.put(`/admin/reps/${id}/demote`);
      toast.success('User demoted');
      fetchReps();
    } catch (e) { toast.error('Failed to demote user'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Class Reps</h2>
          <p className="text-muted-foreground">Oversee assigned representatives.</p>
        </div>
        <Button onClick={() => navigate('/admin/assign-rep')}>
          <ShieldCheck className="mr-2 h-4 w-4" /> Assign New Rep
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Department Context</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reps.map(r => (
                  <tr key={r._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.regNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{r.department}</div>
                      <div className="text-xs text-muted-foreground">Level {r.level}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => handleDemote(r._id)}>
                        <ArrowDownCircle className="h-3 w-3 mr-1" /> Demote
                      </Button>
                    </td>
                  </tr>
                ))}
                {reps.length === 0 && <tr><td colSpan={3} className="text-center py-8">No active Class Reps.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
