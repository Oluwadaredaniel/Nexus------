
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock, Play, Target, BookOpen, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function CreateSession() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // State
  const [sessionType, setSessionType] = useState('COURSE'); // 'COURSE' or 'GENERAL'
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [audience, setAudience] = useState('OPTION'); // Default scope
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/rep/courses');
        setCourses(res.data);
      } catch (e) { toast.error('Failed to load courses'); }
    };
    fetchCourses();
  }, []);

  const handleStart = async () => {
    if (sessionType === 'COURSE' && !selectedCourse) return toast.error('Select a course first');
    if (sessionType === 'GENERAL' && !customTitle) return toast.error('Enter a title for the roll call');

    setLoading(true);
    try {
      await api.post('/rep/sessions', {
        type: sessionType,
        courseId: sessionType === 'COURSE' ? selectedCourse : null,
        title: sessionType === 'GENERAL' ? customTitle : null, // Backend auto-fills for courses
        durationMinutes: duration,
        targetAudience: audience
      });
      toast.success('Session started!');
      navigate('/rep/sessions');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const isFacultyRep = user?.role === 'faculty_rep';
  const isDeptRep = user?.role === 'dept_rep';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Start New Session</h2>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-primary" /> Session Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Session Type Toggle */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-zinc-900 rounded-xl border border-white/10">
             <button 
               onClick={() => setSessionType('COURSE')}
               className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${sessionType === 'COURSE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <BookOpen className="h-4 w-4" /> Academic Course
             </button>
             <button 
               onClick={() => setSessionType('GENERAL')}
               className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${sessionType === 'GENERAL' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <Users className="h-4 w-4" /> General Roll Call
             </button>
          </div>

          {sessionType === 'COURSE' ? (
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
              {courses.length === 0 && <p className="text-xs text-muted-foreground">No courses found for your Level/Department.</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Session Title</label>
              <input 
                placeholder="e.g. Faculty Town Hall Meeting"
                className="w-full p-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Used for meetings, assemblies, or non-academic tracking.</p>
            </div>
          )}

          {/* Scope Selector for High-Ranking Reps */}
          {(isFacultyRep || isDeptRep) && (
            <div className="space-y-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <label className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                <Target className="h-4 w-4" /> Target Audience
              </label>
              <select 
                className="w-full p-3 rounded-lg bg-black/40 border border-indigo-500/30 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="OPTION">My Specific Option/Track Only</option>
                {isDeptRep && <option value="DEPT">Whole Department (All Options)</option>}
                {isFacultyRep && <option value="FACULTY">Whole Faculty (All Departments)</option>}
              </select>
              <p className="text-xs text-indigo-200/60">
                {audience === 'FACULTY' && "Visible to every student in the Faculty."}
                {audience === 'DEPT' && "Visible to every student in the Department."}
                {audience === 'OPTION' && "Visible only to students in your specific option."}
              </p>
            </div>
          )}

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