
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, BarChart, Plus } from 'lucide-react';

export default function ManageLevels() {
  const [levels, setLevels] = useState<any[]>([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { fetchLevels(); }, []);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/admin/levels');
      setLevels(res.data);
    } catch (e) { toast.error('Failed to load levels'); }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post('/admin/levels', data);
      toast.success('Level added');
      reset();
      fetchLevels();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this level?')) return;
    try {
      await api.delete(`/admin/levels/${id}`);
      toast.success('Level deleted');
      fetchLevels();
    } catch (e) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Levels</h2>
          <p className="text-muted-foreground">Configure the years/levels available (e.g., 100, 200, 300).</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add New Level</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
              <input 
                {...register('name', { required: true })} 
                placeholder="e.g. 100" 
                className="flex-1 p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {levels.map(l => (
            <div key={l._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  <BarChart className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-white">{l.name} Lvl</span>
              </div>
              <Button variant="ghost" size="icon" className="hover:text-red-400" onClick={() => handleDelete(l._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {levels.length === 0 && <p className="text-center text-muted-foreground py-4">No levels configured.</p>}
        </div>
      </div>
    </div>
  );
}
