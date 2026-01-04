
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Modal } from '../../components/ui/modal';
import { Edit2, Trash2, Plus, FileSpreadsheet, FileText, Layers, Building2 } from 'lucide-react';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

interface Course {
  _id: string;
  code: string;
  title: string;
  faculty: string;
  department: string;
  option?: string;
  level: string;
  semester: string;
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Metadata for dropdowns
  const [faculties, setFaculties] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Watchers for cascading dropdowns
  const selectedFaculty = watch('faculty');
  const selectedDept = watch('department');

  // Derived Data
  const departments = faculties.find(f => f.name === selectedFaculty)?.departments || [];
  const selectedDeptData = departments.find((d: any) => d.name === selectedDept);
  const options = selectedDeptData?.options || [];

  useEffect(() => {
    fetchCourses();
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (editingCourse) {
      setValue('code', editingCourse.code);
      setValue('title', editingCourse.title);
      setValue('faculty', editingCourse.faculty);
      // Wait for UI update then set Dept
      setTimeout(() => {
        setValue('department', editingCourse.department);
        // Wait then set Option
        setTimeout(() => {
           setValue('option', editingCourse.option);
        }, 50);
      }, 50);
      
      setValue('level', editingCourse.level);
      setValue('semester', editingCourse.semester);
    } else {
      reset();
    }
  }, [editingCourse, setValue, reset]);

  // Resets
  useEffect(() => { if (!editingCourse) { setValue('department', ''); setValue('option', ''); } }, [selectedFaculty]);
  useEffect(() => { if (!editingCourse) { setValue('option', ''); } }, [selectedDept]);


  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load courses');
    }
  };

  const fetchMetadata = async () => {
    try {
      const [facRes, levRes] = await Promise.all([
        api.get('/admin/faculties'),
        api.get('/admin/levels')
      ]);
      setFaculties(facRes.data);
      setLevels(levRes.data);
    } catch (e) { console.error(e); }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Ensure empty option is null
      const payload = { ...data, option: data.option || null };

      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse._id}`, payload);
        toast.success('Course updated');
      } else {
        await api.post('/admin/courses', payload);
        toast.success('Course created');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
      setEditingCourse(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (e) {
      toast.error('Failed to delete course');
    }
  };

  const handleExport = (format: 'xlsx' | 'pdf') => {
    const data = courses.map(c => ({
      Code: c.code,
      Title: c.title,
      Faculty: c.faculty,
      Department: c.department,
      Option: c.option || '-',
      Level: c.level,
      Semester: c.semester
    }));

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Courses");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `courses_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const doc = new jsPDF('l');
      (doc as any).autoTable({
        head: [['Code', 'Title', 'Faculty', 'Department', 'Option', 'Level', 'Sem']],
        body: data.map(Object.values),
        styles: { fontSize: 8 }
      });
      doc.save(`courses_export_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    reset();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Manage Courses</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-white/5 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Context</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{course.code}</td>
                    <td className="px-6 py-4 text-zinc-300">{course.title}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="text-white flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> {course.department}
                      </div>
                      {course.option && (
                        <div className="text-xs mt-1 text-primary flex items-center gap-2">
                          <Layers className="h-3 w-3" /> {course.option}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{course.level}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}>
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(course._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No courses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? "Edit Course" : "Add New Course"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Faculty</label>
              <select
                {...register('faculty', { required: true })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select Faculty</option>
                {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <select
                {...register('department', { required: true })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
                disabled={!selectedFaculty}
              >
                <option value="">Select Dept</option>
                {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {options.length > 0 && (
              <MotionDiv 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-primary">Option / Track (Optional)</label>
                <select
                  {...register('option')}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-primary/30 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">General (All Options)</option>
                  {options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">Select if course is exclusive to a specific track.</p>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Code</label>
              <input
                {...register('code', { required: true })}
                placeholder="e.g. CSC101"
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title</label>
              <input
                {...register('title', { required: true })}
                placeholder="Intro to Computing"
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <select
                {...register('level', { required: true })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select Level</option>
                {levels.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <select
                {...register('semester', { required: true })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Course'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
