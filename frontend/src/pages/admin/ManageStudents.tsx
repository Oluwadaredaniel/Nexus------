
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, Search, User, Shield } from 'lucide-react';

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (e) { toast.error('Failed to load students'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User removed');
      fetchStudents();
    } catch (e) { toast.error('Failed to remove user'); }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.regNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
          <p className="text-muted-foreground">View and manage registered students.</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
           <div className="relative">
             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
             <input 
               placeholder="Search by Name or RegNo..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-10 p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary"
             />
           </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(s => (
                  <tr key={s._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.regNo}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{s.department}</div>
                      <div className="text-xs">Level {s.level} {s.option ? `• ${s.option}` : ''}</div>
                    </td>
                    <td className="px-4 py-3">
                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.role === 'class_rep' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                         {s.role === 'class_rep' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                         {s.role === 'class_rep' ? 'Rep' : 'Student'}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-8">No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
