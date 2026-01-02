
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function Signup() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const setCredentials = useAuthStore(state => state.setCredentials);
  const [loading, setLoading] = useState(false);
  
  // Dynamic Data
  const [faculties, setFaculties] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  
  const selectedFaculty = watch('faculty');
  const selectedDept = watch('department');
  
  // Derived state
  const departments = faculties.find(f => f.name === selectedFaculty)?.departments || [];
  const selectedDeptData = departments.find((d: any) => d.name === selectedDept);
  const hasOptions = selectedDeptData?.options && selectedDeptData.options.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/auth/academic-data');
        setFaculties(res.data.faculties);
        setLevels(res.data.levels);
      } catch (e) { console.error('Failed to load metadata', e); }
    };
    fetchData();
  }, []);

  // Reset dependent fields
  useEffect(() => { setValue('department', ''); setValue('option', ''); }, [selectedFaculty, setValue]);
  useEffect(() => { setValue('option', ''); }, [selectedDept, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Pass null explicitly if no option is selected/available
      const payload = { ...data, option: hasOptions ? data.option : null };
      
      const res = await api.post('/auth/signup', payload);
      setCredentials(res.data, res.data.token);
      toast.success('Account created! Please change your password.');
      navigate('/change-password');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 pointer-events-none" />

      <Card className="w-full max-w-lg glass-card border-white/10 relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Student Registration</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
             Verify your identity against the official class list.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reg No</label>
              <input
                {...register('regNo', { required: 'Reg No is required' })}
                placeholder="e.g. 2021/1234"
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-primary focus:outline-none transition-all"
              />
              {errors.regNo && <p className="text-red-400 text-xs">{String(errors.regNo.message)}</p>}
            </div>

            <div className="space-y-2">
               <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Create Password</label>
               <input
                 type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                placeholder="••••••••"
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-primary focus:outline-none transition-all"
              />
              {errors.password && <p className="text-red-400 text-xs">{String(errors.password.message)}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Faculty</label>
                <select
                  {...register('faculty', { required: 'Select Faculty' })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select Faculty</option>
                  {faculties.map((f: any) => <option key={f._id} value={f.name}>{f.name}</option>)}
                </select>
                {errors.faculty && <p className="text-red-400 text-xs">{String(errors.faculty.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</label>
                <select
                  {...register('department', { required: 'Select Department' })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-primary focus:outline-none"
                  disabled={!selectedFaculty}
                >
                  <option value="">Select Department</option>
                  {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
                {errors.department && <p className="text-red-400 text-xs">{String(errors.department.message)}</p>}
              </div>
            </div>

            {/* Dynamic Option Field */}
            <AnimatePresence>
              {hasOptions && (
                <MotionDiv 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-medium uppercase tracking-wider text-primary">Option / Track</label>
                  <select
                    {...register('option', { required: 'Select Option' })}
                    className="w-full p-3 rounded-lg bg-primary/10 border border-primary/30 focus:ring-primary focus:outline-none text-white"
                  >
                    <option value="">Select Option</option>
                    {selectedDeptData.options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                  </select>
                  {errors.option && <p className="text-red-400 text-xs">{String(errors.option.message)}</p>}
                </MotionDiv>
              )}
            </AnimatePresence>

            <div className="space-y-2">
               <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Level</label>
               <select
                 {...register('level', { required: 'Select Level' })}
                 className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-primary focus:outline-none"
               >
                 <option value="">Select Level</option>
                 {levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
               </select>
               {errors.level && <p className="text-red-400 text-xs">{String(errors.level.message)}</p>}
            </div>
            
            <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Register Account'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded flex gap-2">
             <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
             <p className="text-xs text-yellow-200/80 leading-relaxed">
               You must select the exact Faculty, Department, and Option that was assigned to you by the administration.
             </p>
          </div>

          <div className="mt-6 text-center text-sm">
             <span className="text-muted-foreground">Already have an account? </span>
             <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
