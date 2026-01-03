
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { formatDate } from '../../lib/utils';
import { CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function AttendanceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/attendance/history');
        setHistory(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading records...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">Attendance History</h2>
      
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Session Date</th>
                  <th className="px-6 py-4">Marked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((record, i) => (
                  <MotionDiv 
                    as="tr"
                    key={record._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {record.status === 'present' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium text-xs border border-green-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium text-xs border border-red-500/20">
                          <XCircle className="h-3.5 w-3.5" /> Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{record.session?.course?.code || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{record.session?.course?.title || 'Unknown Course'}</div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      {record.session ? formatDate(record.session.startTime).split(',')[0] : '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </MotionDiv>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}