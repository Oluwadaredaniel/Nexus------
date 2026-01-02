import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';

export default function ChangePassword() {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated');
      updateUser({ isPasswordChanged: true });
      
      if (user?.role === 'super_admin') navigate('/admin');
      else if (user?.role === 'class_rep') navigate('/rep');
      else navigate('/student');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="password"
              {...register('currentPassword', { required: true })}
              placeholder="Current Password"
              className="w-full p-2 rounded-md bg-secondary border border-border"
            />
            <input
              type="password"
              {...register('newPassword', { required: true, minLength: 6 })}
              placeholder="New Password"
              className="w-full p-2 rounded-md bg-secondary border border-border"
            />
            <input
              type="password"
              {...register('confirmPassword', { required: true })}
              placeholder="Confirm New Password"
              className="w-full p-2 rounded-md bg-secondary border border-border"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}