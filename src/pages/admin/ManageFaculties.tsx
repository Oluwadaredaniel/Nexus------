
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Modal } from '../../components/ui/modal';
import { Building2, Plus, Layers, Split } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function ManageFaculties() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  const { register: regFaculty, handleSubmit: subFaculty, reset: resetFaculty } = useForm();
  const { register: regDept, handleSubmit: subDept, reset: resetDept } = useForm();

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/admin/faculties');
      setFaculties(res.data);
    } catch (e) { console.error(e); }
  };

  const onAddFaculty = async (data: any) => {
    try {
      await api.post('/admin/faculties', data);
      toast.success('Faculty added');
      setIsFacultyModalOpen(false);
      resetFaculty();
      fetchFaculties();
    } catch (e) { toast.error('Failed to add faculty'); }
  };

  const onAddDept = async (data: any) => {
    if (!selectedFacultyId) return;
    try {
      // Process options from comma-separated string to array
      const optionsArray = data.optionsString 
        ? data.optionsString.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];

      await api.post('/admin/departments', { 
        name: data.name, 
        options: optionsArray,
        facultyId: selectedFacultyId 
      });
      toast.success('Department added');
      setIsDeptModalOpen(false);
      resetDept();
      fetchFaculties();
    } catch (e) { toast.error('Failed to add department'); }
  };

  const openDeptModal = (id: string) => {
    setSelectedFacultyId(id);
    setIsDeptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faculties & Departments</h2>
          <p className="text-muted-foreground">Structure your institution's academic hierarchy.</p>
        </div>
        <Button onClick={() => setIsFacultyModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Faculty
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {faculties.map((faculty, i) => (
          <MotionDiv 
            key={faculty._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full glass-card border-white/5 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {faculty.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openDeptModal(faculty._id)}>
                  <Plus className="h-4 w-4" /> Dept
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  {faculty.departments?.length === 0 && <p className="text-sm text-muted-foreground italic">No departments yet.</p>}
                  <ul className="space-y-3">
                    {faculty.departments?.map((dept: any) => (
                      <li key={dept._id} className="text-sm p-3 rounded-md bg-white/5 space-y-2">
                         <div className="flex items-center gap-2 font-medium">
                           <Layers className="h-4 w-4 text-muted-foreground" />
                           {dept.name}
                         </div>
                         {dept.options && dept.options.length > 0 && (
                           <div className="pl-6 flex flex-wrap gap-1">
                             {dept.options.map((opt: any) => (
                               <span key={opt._id} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                                 {opt.name}
                               </span>
                             ))}
                           </div>
                         )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </div>

      {/* Add Faculty Modal */}
      <Modal isOpen={isFacultyModalOpen} onClose={() => setIsFacultyModalOpen(false)} title="Add New Faculty">
        <form onSubmit={subFaculty(onAddFaculty)} className="space-y-4">
          <input
            {...regFaculty('name', { required: true })}
            placeholder="Faculty Name (e.g. Faculty of Science)"
            className="w-full p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <Button type="submit" className="w-full">Create Faculty</Button>
        </form>
      </Modal>

      {/* Add Department Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="Add Department">
        <form onSubmit={subDept(onAddDept)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Department Name</label>
            <input
              {...regDept('name', { required: true })}
              placeholder="e.g. Computer Science"
              className="w-full p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Split className="h-3 w-3" /> Options / Tracks (Optional)
            </label>
            <textarea
              {...regDept('optionsString')}
              placeholder="e.g. Software Engineering, Cyber Security (Comma separated)"
              className="w-full p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Split sub-tracks with commas. Leave empty if none.</p>
          </div>

          <Button type="submit" className="w-full">Add Department</Button>
        </form>
      </Modal>
    </div>
  );
}
