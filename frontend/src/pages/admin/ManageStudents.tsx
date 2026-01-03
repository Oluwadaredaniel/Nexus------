
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Trash2, Search, User, Shield, RefreshCw, KeyRound, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (e) { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this user account?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User account removed');
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch (e) { toast.error('Failed to remove user'); }
    finally { setActionLoading(null); }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!window.confirm(`Reset password for ${name} to 'password123'?`)) return;
    setActionLoading(id);
    try {
      await api.put(`/admin/users/${id}/reset-password`);
      toast.success('Password reset successfully');
    } catch (e) { toast.error('Failed to reset password'); }
    finally { setActionLoading(null); }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.regNo.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
          <p className="text-muted-foreground">Accounts overview and credential management.</p>
        </div>
        <Button onClick={fetchStudents} variant="outline" size="icon" className="border-white/10 hover:bg-white/5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
           <div className="relative">
             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
             <input 
               placeholder="Search by Name, RegNo or Department..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-10 p-3 rounded-xl bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-zinc-600"
             />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Student Identity</th>
                  <th className="px-6 py-4">Academic Context</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filtered.map(s => (
                    <MotionDiv 
                      as="tr"
                      key={s._id} 
                      layout
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-base">{s.name}</div>
                        <div className="text-xs text-primary/70 font-mono tracking-wide">{s.regNo}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div className="text-white">{s.department}</div>
                        <div className="text-xs flex items-center gap-2 mt-1">
                          <span className="bg-white/10 px-1.5 py-0.5 rounded">Lvl {s.level}</span>
                          {s.option && <span className="bg-white/10 px-1.5 py-0.5 rounded truncate max-w-[120px]">{s.option}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.role === 'class_rep' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                           {s.role === 'class_rep' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                           {s.role === 'class_rep' ? 'Class Rep' : 'Student'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            onClick={() => handleResetPassword(s._id, s.name)}
                            disabled={actionLoading === s._id}
                            title="Reset Password"
                          >
                            {actionLoading === s._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                            onClick={() => handleDelete(s._id)}
                            disabled={actionLoading === s._id}
                            title="Delete Account"
                          >
                            {actionLoading === s._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </MotionDiv>
                  ))}
                </AnimatePresence>
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No students found matching your search.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground animate-pulse">Loading directory...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}