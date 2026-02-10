
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { GraduationCap, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function MatricNoModal() {
  const { user, updateUser } = useAuthStore();
  const [matricNo, setMatricNo] = useState('');
  const [loading, setLoading] = useState(false);

  // Conditions to show the modal:
  // 1. User is logged in
  // 2. User is a student (or rep who acts as student)
  // 3. User does NOT have a matricNo set
  // 4. User is NOT a super_admin
  const showModal = user && user.role !== 'super_admin' && !user.matricNo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNo.trim()) return toast.error('Please enter your Matric Number');

    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { matricNo: matricNo.trim().toUpperCase() });
      updateUser(res.data); // Update local store with new data containing matricNo
      toast.success('Matric Number Linked Successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            <Card className="border-emerald-500/20 bg-[#09090b] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <GraduationCap className="h-8 w-8 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Finalize Your Profile</CardTitle>
                <p className="text-muted-foreground mt-2 text-sm">
                  You registered with a temporary Reg No. <br/> Please link your official Matriculation Number now.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-500 ml-1">
                      Official Matric Number
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                      <input
                        autoFocus
                        value={matricNo}
                        onChange={(e) => setMatricNo(e.target.value)}
                        placeholder="e.g. CSC/2021/042"
                        className="w-full pl-10 p-3.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all uppercase font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/70 leading-relaxed">
                      This action cannot be undone by you. Ensure the number is correct. It will appear on all faculty attendance sheets.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || matricNo.length < 5}
                    className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    {loading ? 'Linking...' : 'Confirm Identity'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </MotionDiv>
        </motion.div>
      )}
    </AnimatePresence>
  );
}