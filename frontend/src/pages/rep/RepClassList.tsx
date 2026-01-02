
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { User, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function RepClassList() {
  const [students, setStudents] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => { fetchClassList(); }, []);

  const fetchClassList = async () => {
    try {
      const res = await api.get('/rep/students');
      setStudents(res.data);
    } catch (e) { toast.error('Failed to load class list'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Class List</h2>
          <p className="text-muted-foreground">{user?.department} — Level {user?.level} {user?.option ? `(${user.option})` : ''}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
          <Users className="h-3 w-3" /> {students.length} Students
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
           <CardTitle className="text-lg">Registered Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map(s => (
                  <tr key={s._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{s.regNo}</td>
                    <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                    <td className="px-4 py-3">
                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.role === 'class_rep' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                         {s.role === 'class_rep' ? 'Rep' : 'Student'}
                       </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={3} className="text-center py-8">No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
