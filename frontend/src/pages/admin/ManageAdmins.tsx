
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ShieldAlert, UserPlus } from 'lucide-react';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (e) { console.error(e); }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post('/admin/admins', data);
      toast.success('Admin added');
      reset();
      fetchAdmins();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Administrators</h2>
        <p className="text-muted-foreground">Manage privileged accounts with full access.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Create Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register('name', { required: true })} placeholder="Full Name" className="w-full p-2.5 rounded-md bg-secondary border border-border" />
              <input {...register('regNo', { required: true })} placeholder="Username / ID" className="w-full p-2.5 rounded-md bg-secondary border border-border" />
              <input type="password" {...register('password', { required: true })} placeholder="Initial Password" className="w-full p-2.5 rounded-md bg-secondary border border-border" />
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {admins.map(a => (
            <div key={a._id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-white">{a.name}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{a.regNo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
