
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock, Play, Target, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function CreateSession() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hierarchy Logic
  const [audienceScope, setAudienceScope] = useState('DEFAULT'); // 'DEFAULT' (My Scope), 'DEPT_WIDE', 'SPECIFIC_OPTION'
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [targetOption, setTargetOption] = useState('');

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'dept_rep' || user?.role === 'faculty_rep') {
      fetchDepartmentOptions();
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/rep/courses');
      setCourses(res.data);
    } catch (e) { toast.error('Failed to load courses'); }
  };

  const fetchDepartmentOptions = async () => {
    try {
      // Get academic structure to find options for this Rep's department
      const res = await api.get('/auth/academic-data');
      const faculties = res.data.faculties;
      
      // Find Rep's Faculty & Dept
      const myFac = faculties.find((f: any) => f.name === user?.faculty);
      const myDept = myFac?.departments.find((d: any) => d.name === user?.department);
      
      if (myDept && myDept.options) {
        setAvailableOptions(myDept.options.map((o: any) => o.name));
      }
    } catch (e) { console.error('Failed to load options', e); }
  };

  const handleStart = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    if (audienceScope === 'SPECIFIC_OPTION' && !targetOption) return toast.error('Please select the specific option.');

    setLoading(true);
    try {
      // Logic:
      // If Scope is DEFAULT, backend uses Rep's profile.
      // If Scope is DEPT_WIDE, we send targetOption = 'ALL' (Backend convention for wide).
      // If Scope is SPECIFIC_OPTION, we send the selected option string.
      
      let finalTargetOption = null;
      if (audienceScope === 'DEPT_WIDE') finalTargetOption = 'ALL';
      if (audienceScope === 'SPECIFIC_OPTION') finalTargetOption = targetOption;

      await api.post('/rep/sessions', {
        courseId: selectedCourse,
        durationMinutes: duration,
        targetOption: finalTargetOption
      });
      
      toast.success('Session started!');
      navigate('/rep/sessions');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const isHighLevelRep = user?.role === 'dept_rep' || user?.role === 'faculty_rep';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Start New Session</h2>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-primary" /> Session Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Course Selection */}
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

          {/* Advanced Audience Scope (For Dept Reps+) */}
          {isHighLevelRep && (
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-bold text-indigo-200">Target Audience (Override)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAudienceScope('DEFAULT')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all text-left border ${audienceScope === 'DEFAULT' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/5 text-zinc-400 hover:bg-white/5'}`}
                >
                  <span className="block text-xs uppercase tracking-wider opacity-70 mb-1">Standard</span>
                  My Cohort Only
                </button>
                <button
                  onClick={() => setAudienceScope('DEPT_WIDE')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all text-left border ${audienceScope === 'DEPT_WIDE' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/5 text-zinc-400 hover:bg-white/5'}`}
                >
                  <span className="block text-xs uppercase tracking-wider opacity-70 mb-1">Broad</span>
                  Entire Department
                </button>
                {availableOptions.length > 0 && (
                  <button
                    onClick={() => setAudienceScope('SPECIFIC_OPTION')}
                    className={`col-span-2 p-3 rounded-lg text-sm font-medium transition-all text-left border ${audienceScope === 'SPECIFIC_OPTION' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/5 text-zinc-400 hover:bg-white/5'}`}
                  >
                    <span className="block text-xs uppercase tracking-wider opacity-70 mb-1">Targeted</span>
                    Specific Option (Step In)
                  </button>
                )}
              </div>

              {/* Dropdown for Specific Option */}
              <AnimatePresence>
                {audienceScope === 'SPECIFIC_OPTION' && (
                  <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <select
                      className="w-full p-2.5 rounded-lg bg-black/40 border border-indigo-500/30 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={targetOption}
                      onChange={(e) => setTargetOption(e.target.value)}
                    >
                      <option value="">-- Select Specific Option --</option>
                      {availableOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <p className="text-xs text-indigo-400/70 mt-2">
                      Use this when the Class Rep for this option is unavailable.
                    </p>
                  </MotionDiv>
                )}
              </AnimatePresence>
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
