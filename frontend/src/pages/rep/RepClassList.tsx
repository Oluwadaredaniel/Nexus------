
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { User, Users, Plus, Edit2, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function RepClassList() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuthStore();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => { fetchClassList(); }, []);

  useEffect(() => {
    if (editingStudent) {
      setValue('name', editingStudent.name);
      setValue('regNo', editingStudent.regNo);
    } else {
      reset();
    }
  }, [editingStudent, setValue, reset]);

  const fetchClassList = async () => {
    try {
      const res = await api.get('/rep/students');
      setStudents(res.data);
    } catch (e) { toast.error('Failed to load class list'); }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (editingStudent) {
        await api.put(`/rep/class-list/${editingStudent._id}`, data);
        toast.success('Student updated');
      } else {
        await api.post('/rep/class-list', data);
        toast.success('Student added to list');
      }
      setIsModalOpen(false);
      fetchClassList();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
      setEditingStudent(null);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.regNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class List</h2>
          <p className="text-muted-foreground">{user?.department} — Level {user?.level}</p>
        </div>
        <Button onClick={openAddModal} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
           <div className="relative">
             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
             <input 
               placeholder="Search by Name or RegNo..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-10 p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary"
             />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Reg No</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filtered.map((s, i) => (
                    <MotionDiv 
                      as="tr"
                      key={s.regNo} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{s.regNo}</td>
                      <td className={`px-6 py-4 font-medium ${s.hasAccount ? 'text-white' : 'text-muted-foreground italic'}`}>
                        {s.name}
                      </td>
                      <td className="px-6 py-4">
                         {s.hasAccount ? (
                           <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground text-xs font-medium border border-white/10">
                             <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Pending Signup
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => openEditModal(s)}>
                          <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
                        </Button>
                      </td>
                    </MotionDiv>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? "Edit Student" : "Add Student to List"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Registration Number</label>
            <input 
              {...register('regNo', { required: true })} 
              placeholder="e.g. CSC/2021/001"
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              {...register('name', { required: true })} 
              placeholder="e.g. John Doe"
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : editingStudent ? 'Update Entry' : 'Add to Class List'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}