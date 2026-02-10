
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { ShieldCheck, UserPlus, ArrowDownCircle, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function ManageTeam() {
  const { user } = useAuthStore();
  const [reps, setReps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/rep/team');
      setReps(res.data);
    } catch (e) { toast.error('Failed to load team'); }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/rep/team/assign', data);
      toast.success('Rep assigned successfully');
      reset();
      setIsModalOpen(false);
      fetchTeam();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async (id: string) => {
    if (!window.confirm("Remove this user's Rep privileges?")) return;
    try {
      await api.put(`/rep/team/${id}/demote`);
      toast.success('User demoted');
      fetchTeam();
    } catch (e) { toast.error('Failed'); }
  };

  if (user?.role !== 'faculty_rep') return <div className="p-10 text-center text-red-500">Access Restricted</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faculty Leadership</h2>
          <p className="text-muted-foreground">Manage Dept and Class Reps in {user.faculty}.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-amber-600 hover:bg-amber-500 text-black font-bold">
          <UserPlus className="mr-2 h-4 w-4" /> Appoint Rep
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Context</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {reps.map((r, i) => (
                    <MotionDiv 
                      as="tr"
                      key={r._id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{r.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{r.regNo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.role === 'dept_rep' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {r.role === 'dept_rep' ? 'Department Rep' : 'Class/Option Rep'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div>{r.department}</div>
                        {r.option && <div className="text-xs text-amber-500/80">{r.option}</div>}
                        <div className="text-xs">Level {r.level}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDemote(r._id)} className="hover:text-red-400 hover:bg-red-500/10">
                          <ArrowDownCircle className="h-4 w-4" />
                        </Button>
                      </td>
                    </MotionDiv>
                  ))}
                </AnimatePresence>
                {reps.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No sub-reps assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Appoint New Representative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Registration Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input 
                {...register('regNo', { required: true })}
                placeholder="e.g. CSC/2021/042"
                className="w-full pl-10 p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground">Student must already be signed up.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Role Assignment</label>
            <select 
              {...register('role', { required: true })}
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="class_rep">Class Rep (Option Level)</option>
              <option value="dept_rep">Department Rep (Dept Level)</option>
            </select>
          </div>

          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Appointment'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}