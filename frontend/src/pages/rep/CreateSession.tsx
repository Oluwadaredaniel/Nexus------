
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CreateSession() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/admin/courses');
        setCourses(res.data);
      } catch (e) { toast.error('Failed to load courses'); }
    };
    fetchCourses();
  }, []);

  const handleStart = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    setLoading(true);
    try {
      await api.post('/rep/sessions', {
        courseId: selectedCourse,
        durationMinutes: duration
      });
      toast.success('Session started!');
      navigate('/rep/sessions');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Start New Session</h2>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-primary" /> Session Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Select Course</label>
            <select 
              className="w-full p-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Duration (Minutes)</label>
            <div className="relative">
              <input 
                type="number" 
                min="10"
                max="180"
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-3 pl-10 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Session will auto-expire after this time.</p>
          </div>

          <Button className="w-full h-12 text-lg font-bold" onClick={handleStart} disabled={loading}>
            {loading ? 'Starting...' : 'Launch Session'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
