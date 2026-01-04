
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ShieldCheck, UserSearch, AlertCircle, Building2, Layers, BarChart, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function AssignRep() {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  
  const [faculties, setFaculties] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  // Watchers
  const selectedFaculty = watch('faculty');
  const selectedDept = watch('department');
  const selectedRole = watch('role');

  const departments = faculties.find(f => f.name === selectedFaculty)?.departments || [];
  const selectedDeptData = departments.find((d: any) => d.name === selectedDept);
  const options = selectedDeptData?.options || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, levRes] = await Promise.all([
          api.get('/admin/faculties'),
          api.get('/admin/levels')
        ]);
        setFaculties(facRes.data);
        setLevels(levRes.data);
      } catch(e) { console.error(e); }
    };
    fetchData();
  }, []);

  // Cascading Resets
  useEffect(() => { setValue('department', ''); setValue('option', ''); }, [selectedFaculty, setValue]);
  useEffect(() => { setValue('option', ''); }, [selectedDept, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = { ...data, option: data.option || null };
      const res = await api.post('/admin/assign-classrep', payload);
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
        <h2 className="text-3xl font-bold tracking-tight">Assign Representative</h2>
        <p className="text-muted-foreground">Grant leadership privileges to students.</p>
      </div>

      <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" /> Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-primary">
                  <Crown className="h-3 w-3" /> Representative Role
                </label>
                <select 
                  {...register('role', { required: true })}
                  className="w-full p-2.5 rounded-lg bg-primary/10 border border-primary/30 focus:ring-2 focus:ring-primary outline-none text-white font-medium"
                >
                  <option value="">Select Role Type</option>
                  <option value="class_rep">Option / Class Rep (Lowest Level)</option>
                  <option value="dept_rep">Department Rep (Whole Dept)</option>
                  <option value="faculty_rep">Faculty Rep (Whole Faculty)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {selectedRole === 'class_rep' && "Controls sessions for a specific Option/Track."}
                  {selectedRole === 'dept_rep' && "Controls sessions for the entire Department (all options)."}
                  {selectedRole === 'faculty_rep' && "Controls sessions for the entire Faculty."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Building2 className="h-3 w-3" /> Faculty</label>
                  <select 
                    {...register('faculty', { required: true })}
                    className="w-full p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Layers className="h-3 w-3" /> Department</label>
                  <select 
                    {...register('department', { required: true })}
                    className="w-full p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
                    disabled={!selectedFaculty}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Logic: Show Option selection IF options exist AND Role is 'class_rep' */}
              {/* Dept/Faculty Reps still belong to an option academically, so we allow selection, but their POWER overrides it */}
              <AnimatePresence>
                {options.length > 0 && (
                  <MotionDiv 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-white/80">
                      Option / Track 
                      <span className="text-xs text-muted-foreground font-normal ml-2">
                        (Student's academic track)
                      </span>
                    </label>
                    <select 
                      {...register('option')}
                      className="w-full p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="">Select Option (If applicable)</option>
                      {options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                    </select>
                  </MotionDiv>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><BarChart className="h-3 w-3" /> Level</label>
                <select 
                  {...register('level', { required: true })}
                  className="w-full p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select Level</option>
                  {levels.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-sm font-medium ml-1">Student Registration Number</label>
                <div className="relative">
                  <UserSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    {...register('regNo', { required: true })}
                    placeholder="e.g. 2021/12345"
                    className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none transition-all uppercase placeholder:normal-case"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200/80 leading-relaxed">
                  The student must be in the uploaded class list for the selected <strong>Department & Level</strong> and must have signed up on NEXUS.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Role'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
