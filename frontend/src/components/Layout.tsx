
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Home, Users, BarChart, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation();

  if (!user) return null;

  const links = user.role === 'super_admin' 
    ? [ { icon: BarChart, path: '/admin', label: 'Overview' }, { icon: Layers, path: '/admin/faculties', label: 'Structure' }, { icon: Users, path: '/admin/class-lists', label: 'Class Lists' }, { icon: BookOpen, path: '/admin/courses', label: 'Courses' } ]
    : user.role === 'class_rep'
    ? [ { icon: Home, path: '/rep', label: 'Sessions' } ]
    : [ { icon: Home, path: '/student', label: 'Home' }, { icon: BookOpen, path: '/student/history', label: 'History' }, { icon: Users, path: '/student/profile', label: 'ID Card' } ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-card/20 hidden md:flex flex-col p-4">
        <h1 className="text-xl font-bold mb-8 text-primary tracking-widest">NEXUS</h1>
        <nav className="space-y-2 flex-1">
          {links.map(l => (
            <button key={l.path} onClick={() => navigate(l.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${loc.pathname === l.path ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:bg-white/5'}`}>
              <l.icon size={18} /> {l.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl"><LogOut size={18} /> Sign Out</button>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-8 relative">
        <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
