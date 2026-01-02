import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const setCredentials = useAuthStore(state => state.setCredentials);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setCredentials(res.data, res.data.token);
      toast.success(`Welcome back, ${res.data.name}`);
      
      if (!res.data.isPasswordChanged && res.data.role !== 'super_admin') {
        navigate('/change-password');
        return;
      }

      switch (res.data.role) {
        case 'super_admin': navigate('/admin'); break;
        case 'class_rep': navigate('/rep'); break;
        default: navigate('/student');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 relative z-10"
      >
        <Card className="glass-card border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-2 pt-8">
            <MotionDiv 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-primary/30"
            >
              N
            </MotionDiv>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to access NEXUS</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Reg No / ID</label>
                <input
                  {...register('regNo', { required: 'Reg No is required' })}
                  placeholder="e.g. 2021/12345"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-white"
                />
                {errors.regNo && <p className="text-red-400 text-xs ml-1">{String(errors.regNo.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-white"
                />
                {errors.password && <p className="text-red-400 text-xs ml-1">{String(errors.password.message)}</p>}
              </div>
              <Button type="submit" className="w-full h-12 text-base font-medium mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center">Sign In <ArrowRight className="ml-2 h-4 w-4" /></span>}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              New Student? <Link to="/signup" className="text-primary hover:text-primary/80 font-medium hover:underline transition-all">Create Account</Link>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}