
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Shield, Info } from 'lucide-react';

const MotionDiv = motion.div as any;

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const setCredentials = useAuthStore(s => s.setCredentials);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('BOTH');

  useEffect(() => {
    // Get public config to set UI state
    api.get('/auth/stats').then(res => setLoginMode(res.data.loginMode)).catch(() => {});
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setCredentials(res.data, res.data.token);
      toast.success(`Welcome ${res.data.name}`);
      if (!res.data.isPasswordChanged && res.data.role !== 'super_admin') navigate('/auth/change-password');
      else if (res.data.role === 'super_admin') navigate('/admin');
      else if (res.data.role.includes('rep')) navigate('/rep');
      else navigate('/student');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const getPlaceholder = () => {
    if (loginMode === 'MATRIC_ONLY') return 'Matric Number';
    if (loginMode === 'REG_ONLY') return 'Registration Number';
    return 'Reg No / Matric No';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -top-20 -left-20" />
      <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8 rounded-3xl glass border border-white/10 z-10">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">NEXUS</h2>
        <p className="text-zinc-400 text-center mb-8">Academic credentials required.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input 
              {...register('regNo')} 
              placeholder={getPlaceholder()} 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none font-mono uppercase placeholder:normal-case" 
              required 
            />
          </div>
          <input type="password" {...register('password')} placeholder="Password" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" required />
          <button disabled={loading} className="w-full py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/90 transition-colors">{loading ? '...' : 'Sign In'}</button>
        </form>

        <div className="mt-6 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
           <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
           <p className="text-xs text-indigo-200/70 leading-relaxed">
             <strong>First time?</strong> Always use your <strong>Class List Reg No</strong> to log in initially. You can link your Matric Number in your profile later.
           </p>
        </div>

        <div className="mt-6 text-center text-zinc-500 text-sm">
          New Student? <Link to="/signup" className="text-primary hover:underline">Register here</Link>
        </div>
      </MotionDiv>
    </div>
  );
}