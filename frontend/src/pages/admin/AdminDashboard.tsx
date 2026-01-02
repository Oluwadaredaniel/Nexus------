
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.get('/admin/analytics').then(res => setStats(res.data)); }, []);

  if (!stats) return <div className="text-white">Loading...</div>;

  const cards = [
    { title: 'Total Students', val: stats.totalStudents, icon: Users },
    { title: 'Courses', val: stats.totalCourses, icon: BookOpen },
    { title: 'Attendance', val: stats.totalAttendance, icon: UserCheck },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-400 text-sm font-medium">{c.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{c.val}</h3>
              </div>
              <c.icon className="text-primary" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card h-80">
          <h3 className="text-white font-bold mb-4">Activity Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[{n:'M',v:10}, {n:'T',v:30}, {n:'W',v:20}, {n:'T',v:50}, {n:'F',v:40}]}>
              <XAxis dataKey="n" stroke="#555" />
              <Tooltip contentStyle={{ background: '#333', border: 'none' }} />
              <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="#8b5cf633" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-2xl glass-card">
          <h3 className="text-white font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((a: any) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-zinc-200">{a.student.name}</span>
                <span className="text-xs text-zinc-500">{new Date(a.markedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
