
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/change-password', data);
      updateUser({ isPasswordChanged: true });
      toast.success('Password updated');
      navigate(user?.role === 'student' ? '/student' : user?.role === 'class_rep' ? '/rep' : '/admin');
    } catch (e: any) { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-3xl glass">
        <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="password" {...register('currentPassword')} placeholder="Current Password" class="w-full p-3 bg-white/5 rounded-xl text-white" required />
          <input type="password" {...register('newPassword')} placeholder="New Password" class="w-full p-3 bg-white/5 rounded-xl text-white" required />
          <button className="w-full py-3 bg-primary rounded-xl font-bold text-white">{loading ? '...' : 'Update'}</button>
        </form>
      </div>
    </div>
  );
}
