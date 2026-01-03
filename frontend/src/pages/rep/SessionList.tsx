
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import SessionCard from '../../components/shared/SessionCard';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '../../lib/utils';

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
      const data = res.data.map((r: any) => ({
        RegNo: r.regNo,
        Name: r.student.name,
        Time: formatDate(r.markedAt),
        Status: r.status.toUpperCase()
      }));

      if (data.length === 0) {
        toast.dismiss(toastId);
        toast.error('No attendance records found for this session.');
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
        const session = sessions.find(s => s._id === sessionId);
        const title = session ? `${session.course.code} - ${session.course.title}` : 'Attendance Report';
        
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Date: ${formatDate(new Date())}`, 14, 22);
        
        (doc as any).autoTable({
          startY: 25,
          head: [['Reg No', 'Name', 'Time', 'Status']],
          body: data.map((row: any) => [row.RegNo, row.Name, row.Time, row.Status]),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [79, 70, 229] } // Indigo color
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
        {sessions.map(s => (
          <SessionCard 
            key={s._id} 
            session={s} 
            role="rep" 
            onAction={s.isActive ? handleEndSession : undefined}
            onExport={handleExport}
          />
        ))}
        {sessions.length === 0 && <p className="text-muted-foreground col-span-full text-center py-10">No sessions found.</p>}
      </div>
    </div>
  );
}