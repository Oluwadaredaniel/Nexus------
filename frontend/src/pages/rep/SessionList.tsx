
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import SessionCard from '../../components/shared/SessionCard';
import { Button } from '../../components/ui/button';
import { Plus, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function SessionList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/rep/sessions');
      setSessions(res.data);
    } catch (e) { toast.error('Failed to load sessions'); }
  };

  const handleEndSession = async (id: string) => {
    if(!window.confirm('End this session now?')) return;
    try {
      await api.put(`/rep/sessions/${id}/end`);
      toast.success('Session ended');
      fetchSessions();
    } catch(e) { toast.error('Failed to end'); }
  };

  const handleExport = async (sessionId: string, format: 'xlsx' | 'pdf') => {
    const toastId = toast.loading('Generating report...');
    try {
      const res = await api.get(`/attendance/session/${sessionId}/attendees`);
      
      const session = sessions.find(s => s._id === sessionId);
      const isBroad = session?.department === 'ALL' || session?.option === 'ALL';

      const data = res.data.map((r: any) => {
        const row: any = {
          RegNo: r.regNo,
          Name: r.student.name,
        };
        if (isBroad) {
          row.Department = r.student.department || '-';
          row.Option = r.student.option || '-';
        }
        row.Time = formatDate(r.markedAt);
        row.Status = r.status.toUpperCase();
        return row;
      });

      if (data.length === 0) {
        toast.dismiss(toastId);
        toast.error('No attendance records found.');
        return;
      }

      if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
        saveAs(blob, `attendance_${sessionId}.xlsx`);
      } else {
        const doc = new jsPDF();
        const title = session ? `${session.course.code} - ${session.course.title}` : 'Attendance Report';
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Date: ${formatDate(new Date())} | Scope: ${isBroad ? 'Multi-Department' : 'Class'}`, 14, 22);
        
        const headers = isBroad 
          ? [['Reg No', 'Name', 'Dept', 'Option', 'Time', 'Status']]
          : [['Reg No', 'Name', 'Time', 'Status']];

        (doc as any).autoTable({
          startY: 25,
          head: headers,
          body: data.map((row: any) => Object.values(row)),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [79, 70, 229] }
        });
        doc.save(`attendance_${sessionId}.pdf`);
      }
      toast.success('Export downloaded!', { id: toastId });
    } catch (e) { 
      toast.error('Export failed', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Sessions</h2>
          <p className="text-muted-foreground">Active and past classes.</p>
        </div>
        <Button onClick={() => navigate('/rep/create-session')}>
          <Plus className="mr-2 h-4 w-4" /> Start New
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(s => {
           const isActive = s.isActive && new Date() < new Date(s.endTime);
           return (
             <div key={s._id} className="relative group">
                <SessionCard 
                  session={s} 
                  role="rep" 
                  onAction={isActive ? handleEndSession : undefined}
                  onExport={handleExport}
                />
                {isActive && (
                  <MotionDiv 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4 z-20"
                  >
                    <Button 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); navigate(`/rep/session/${s._id}/monitor`); }}
                      className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full h-8 px-3 text-xs"
                    >
                      <Activity className="h-3 w-3 mr-1.5 text-emerald-400 animate-pulse" /> Live Monitor
                    </Button>
                  </MotionDiv>
                )}
             </div>
           );
        })}
        {sessions.length === 0 && <p className="text-muted-foreground col-span-full text-center py-10">No sessions found.</p>}
      </div>
    </div>
  );
}
