
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, User, Calendar, Hash, Edit2, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function AdminProfile() {
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm();

  // Watchers for dynamic dropdowns
  const selectedFaculty = watch('faculty');
  const selectedDept = watch('department');

  // Derived Data
  const departments = faculties.find(f => f.name === selectedFaculty)?.departments || [];
  const selectedDeptData = departments.find((d: any) => d.name === selectedDept);
  const options = selectedDeptData?.options || [];

  useEffect(() => {
    // Fetch system stats
    api.get('/admin/analytics').then(res => setStats(res.data)).catch(() => {});
    
    // Fetch academic data for edit form
    api.get('/auth/academic-data').then(res => {
      setFaculties(res.data.faculties);
      setLevels(res.data.levels);
    });
  }, []);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isEditOpen && user) {
      setValue('name', user.name);
      setValue('matricNo', user.matricNo || '');
      setValue('faculty', user.faculty || '');
      setValue('department', user.department || '');
      setValue('option', user.option || '');
      setValue('level', user.level || '');
    }
  }, [isEditOpen, user, setValue]);

  // Dynamic resets
  useEffect(() => { if (isEditOpen) { setValue('department', ''); setValue('option', ''); } }, [selectedFaculty, setValue, isEditOpen]);
  useEffect(() => { if (isEditOpen) { setValue('option', ''); } }, [selectedDept, setValue, isEditOpen]);

  const onUpdateProfile = async (data: any) => {
    setLoading(true);
    try {
      // Ensure option is null if empty
      const payload = { ...data, option: data.option || null };
      const res = await api.put('/auth/profile', payload);
      
      updateUser(res.data);
      toast.success('Identity Updated');
      setIsEditOpen(false);
    } catch (e: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
           <p className="text-muted-foreground">System Administrator Credentials</p>
        </div>
      </div>

      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
        {/* ID Card Style */}
        <Card className="md:col-span-1 border-0 bg-gradient-to-br from-red-900/40 to-black border-l-4 border-l-red-500 relative overflow-hidden shadow-xl h-fit">
           <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-3xl font-bold text-red-500 border border-red-500/30">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-red-400 text-sm font-medium tracking-wider mt-1">SUPER ADMIN</p>
              <div className="mt-6 w-full pt-6 border-t border-white/10 space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">ID</span>
                   <span className="font-mono text-white">{user.regNo}</span>
                 </div>
                 {user.matricNo && (
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Matric</span>
                     <span className="font-mono text-cyan-400">{user.matricNo}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Access</span>
                   <span className="text-green-400">Full System</span>
                 </div>
              </div>
           </CardContent>
           <div className="absolute top-0 right-0 p-32 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />
        </Card>

        {/* Details & Stats */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" /> Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid sm:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                     <User className="h-4 w-4" /> Full Name
                   </div>
                   <div className="font-medium text-lg">{user.name}</div>
                 </div>
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                     <Hash className="h-4 w-4" /> Admin ID
                   </div>
                   <div className="font-mono text-lg">{user.regNo}</div>
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Student Context Section */}
          <Card className="glass-card border-indigo-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
                <GraduationCap className="h-5 w-5" /> Student Context
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                <Edit2 className="h-3 w-3 mr-2" /> Edit Identity
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your academic profile to participate in sessions as a student (e.g. for testing or dual roles).
              </p>
              {user.department ? (
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                      <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Department</div>
                      <div className="font-bold text-white">{user.department}</div>
                   </div>
                   {user.option && (
                     <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                        <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Track/Option</div>
                        <div className="font-bold text-white">{user.option}</div>
                     </div>
                   )}
                   <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                      <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Level</div>
                      <div className="font-bold text-white">{user.level} Lvl</div>
                   </div>
                   {user.matricNo && (
                     <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                        <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Matric No</div>
                        <div className="font-bold text-white font-mono">{user.matricNo}</div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-white/10 text-center text-sm text-muted-foreground">
                  No academic context set. You cannot mark attendance yet.
                </div>
              )}
            </CardContent>
          </Card>

          {stats && (
             <div className="grid grid-cols-3 gap-4 text-center">
               <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Students</div>
               </div>
               <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Courses</div>
               </div>
               <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="text-2xl font-bold text-white">{stats.totalAttendance}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Records</div>
               </div>
             </div>
          )}
        </div>
      </MotionDiv>

      {/* Edit Identity Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Configure Academic Identity">
        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              {...register('name')} 
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-400">Matriculation Number</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <input 
                {...register('matricNo')} 
                placeholder="e.g. CSC/2021/042"
                className="w-full pl-10 p-2.5 rounded-lg bg-zinc-900 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 outline-none uppercase font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Required if you want to test attendance.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Faculty</label>
              <select 
                {...register('faculty')}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Faculty</option>
                {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <select 
                {...register('department')}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
                disabled={!selectedFaculty}
              >
                <option value="">Select Dept</option>
                {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {options.length > 0 && (
              <MotionDiv 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-indigo-400">Option / Track</label>
                <select 
                  {...register('option')}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-indigo-500/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Option</option>
                  {options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                </select>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Level</label>
            <select 
              {...register('level')}
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Level</option>
              {levels.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
            </select>
          </div>

          <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}