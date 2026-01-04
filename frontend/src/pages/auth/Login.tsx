
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const setCredentials = useAuthStore(s => s.setCredentials);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setCredentials(res.data, res.data.token);
      toast.success(`Welcome ${res.data.name}`);
      if (!res.data.isPasswordChanged && res.data.role !== 'super_admin') navigate('/auth/change-password');
      else if (res.data.role === 'super_admin') navigate('/admin');
      else if (res.data.role === 'class_rep') navigate('/rep');
      else navigate('/student');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -top-20 -left-20" />
      <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8 rounded-3xl glass border border-white/10 z-10">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">NEXUS</h2>
        <p className="text-zinc-400 text-center mb-8">Academic credentials required.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('regNo')} placeholder="Reg No" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" required />
          <input type="password" {...register('password')} placeholder="Password" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" required />
          <button disabled={loading} className="w-full py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/90 transition-colors">{loading ? '...' : 'Sign In'}</button>
        </form>
        <div className="mt-6 text-center text-zinc-500 text-sm">
          New Student? <Link to="/signup" className="text-primary hover:underline">Register here</Link>
        </div>
      </MotionDiv>
    </div>
  );
}
