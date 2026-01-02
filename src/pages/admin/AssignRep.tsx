
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ShieldCheck, UserSearch, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function AssignRep() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/assign-classrep', data);
      toast.success(res.data.message);
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign rep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assign Class Representative</h2>
        <p className="text-muted-foreground">Promote a student to manage sessions and attendance for their level.</p>
      </div>

      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" /> Student Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Student Registration Number</label>
                <div className="relative">
                  <UserSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    {...register('regNo', { required: true })}
                    placeholder="e.g. 2021/12345"
                    className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200/80">
                  Promoting a student will grant them access to the <strong>Class Rep Dashboard</strong>. 
                  They will be able to start sessions and create attendance codes for their department and level.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? 'Processing...' : 'Promote to Class Rep'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
