
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Edit2, Trash2, Plus, FileSpreadsheet, FileText } from 'lucide-react';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Modal } from '../../components/ui/modal';

interface Course {
  _id: string;
  code: string;
  title: string;
  department: string;
  level: string;
  semester: string;
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (editingCourse) {
      setValue('code', editingCourse.code);
      setValue('title', editingCourse.title);
      setValue('department', editingCourse.department);
      setValue('level', editingCourse.level);
      setValue('semester', editingCourse.semester);
    } else {
      reset();
    }
  }, [editingCourse, setValue, reset]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load courses');
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse._id}`, data);
        toast.success('Course updated');
      } else {
        await api.post('/admin/courses', data);
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
      Department: c.department,
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
      const doc = new jsPDF();
      (doc as any).autoTable({
        head: [['Code', 'Title', 'Department', 'Level', 'Semester']],
        body: data.map(Object.values),
      });
      doc.save(`courses_export_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
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

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-secondary/50 uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Sem</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{course.code}</td>
                    <td className="px-4 py-3">{course.title}</td>
                    <td className="px-4 py-3">{course.department}</td>
                    <td className="px-4 py-3">{course.level}</td>
                    <td className="px-4 py-3">{course.semester}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(course)}>
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
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">No courses found.</td>
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
            <div>
              <label className="text-sm font-medium">Course Code</label>
              <input
                {...register('code', { required: true })}
                placeholder="e.g. CSC101"
                className="w-full p-2 mt-1 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Level</label>
              <input
                {...register('level', { required: true })}
                placeholder="e.g. 100"
                className="w-full p-2 mt-1 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Course Title</label>
            <input
              {...register('title', { required: true })}
              placeholder="Introduction to Computing"
              className="w-full p-2 mt-1 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Department</label>
              <input
                {...register('department', { required: true })}
                placeholder="Computer Science"
                className="w-full p-2 mt-1 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Semester</label>
              <select
                {...register('semester', { required: true })}
                className="w-full p-2 mt-1 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Course'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}