
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Signup() {
  const { register, handleSubmit, watch, setValue } = useForm();
  const navigate = useNavigate();
  const setCredentials = useAuthStore(s => s.setCredentials);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ faculties: any[], levels: any[] }>({ faculties: [], levels: [] });

  const selFac = watch('faculty');
  const selDept = watch('department');
  const departments = meta.faculties.find((f: any) => f.name === selFac)?.departments || [];
  const options = departments.find((d: any) => d.name === selDept)?.options || [];

  useEffect(() => { api.get('/auth/academic-data').then(res => setMeta(res.data)); }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', data);
      setCredentials(res.data, res.data.token);
      toast.success('Account created');
      navigate('/change-password');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg p-8 rounded-3xl glass border border-white/10">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Student Registration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('regNo')} placeholder="Reg No" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white" required />
          <input type="password" {...register('password')} placeholder="Create Password" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white" required />
          
          <div className="grid grid-cols-2 gap-4">
            <select {...register('faculty')} className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300" required>
              <option value="">Faculty</option>
              {meta.faculties.map((f: any) => <option key={f._id} value={f.name}>{f.name}</option>)}
            </select>
            <select {...register('department')} className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300" required disabled={!selFac}>
              <option value="">Department</option>
              {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          {options.length > 0 && (
            <select {...register('option')} className="w-full p-3 bg-white/5 border border-primary/50 rounded-xl text-zinc-300" required>
              <option value="">Select Option / Track</option>
              {options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
            </select>
          )}

          <select {...register('level')} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300" required>
             <option value="">Level</option>
             {meta.levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
          </select>

          <button disabled={loading} className="w-full py-3 bg-primary rounded-xl font-bold text-white">{loading ? '...' : 'Verify & Register'}</button>
        </form>
        <p className="mt-4 text-center text-xs text-yellow-500">Must match official class list data exactly.</p>
        <div className="mt-4 text-center text-sm"><Link to="/login" className="text-zinc-400 hover:text-white">Back to Login</Link></div>
      </motion.div>
    </div>
  );
}
