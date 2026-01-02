
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, Building2, UserCog, User, Home, Radio, CheckCircle, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import InstallPrompt from './InstallPrompt';
import OfflineBanner from './OfflineBanner';

const MotionDiv = motion.div as any;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const adminLinks = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Building2, label: "Faculties", path: "/admin/faculties" },
    { icon: BookOpen, label: "Courses", path: "/admin/courses" },
    { icon: Users, label: "Students", path: "/admin/students" },
    { icon: UserCog, label: "Reps", path: "/admin/reps" },
    { icon: Radio, label: "Sessions", path: "/admin/sessions" },
    // Shared Student Functionalities for Admin
    { icon: CheckCircle, label: "Mark Attendance", path: "/mark-attendance" },
    { icon: GraduationCap, label: "My History", path: "/history" },
  ];

  const repLinks = [
    { icon: LayoutDashboard, label: "Dash", path: "/rep" },
    { icon: Radio, label: "Manage Sessions", path: "/rep/sessions" },
    { icon: Users, label: "Class List", path: "/rep/students" },
    // Shared Student Functionalities for Rep
    { icon: CheckCircle, label: "Mark Attendance", path: "/mark-attendance" },
    { icon: GraduationCap, label: "My History", path: "/history" },
  ];

  const studentLinks = [
    { icon: Home, label: "Home", path: "/student" },
    { icon: CheckCircle, label: "Mark Attendance", path: "/mark-attendance" },
    { icon: GraduationCap, label: "My History", path: "/history" },
    { icon: User, label: "ID Card", path: "/student/profile" },
  ];

  const links = user.role === 'super_admin' ? adminLinks : user.role === 'class_rep' ? repLinks : studentLinks;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/20">
      <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-20 pointer-events-none z-0" />
      
      <OfflineBanner />
      <InstallPrompt />

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/20 backdrop-blur-2xl hidden md:flex flex-col relative z-20">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-bold text-white text-lg">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">NEXUS</h1>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Academic Suite</span>
            </div>
          </div>
          
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
            {links.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-300",
                  location.pathname === link.path && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium"
                )}
                onClick={() => navigate(link.path)}
              >
                <link.icon className={cn("h-4 w-4", location.pathname === link.path && "text-primary")} />
                {link.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors" onClick={() => user.role === 'student' && navigate('/student/profile')}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 group transition-all" onClick={handleLogout}>
            <LogOut className="h-3 w-3 group-hover:text-red-400 transition-colors" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel pb-safe pt-2 px-2">
        <div className="flex justify-around items-center h-16">
          {links.slice(0, 4).map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                location.pathname === link.path ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              <div className={cn("p-1.5 rounded-xl transition-all", location.pathname === link.path && "bg-primary/10")}>
                <link.icon className={cn("h-5 w-5", location.pathname === link.path && "stroke-[2.5px]")} />
              </div>
              <span className="text-[10px] font-medium truncate w-16 text-center">{link.label}</span>
            </button>
          ))}
          <button
             onClick={handleLogout}
             className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <div className="p-1.5">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Exit</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={location.pathname}
            initial={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} 
            className="p-4 md:p-8 max-w-7xl mx-auto min-h-full"
          >
            <Outlet />
          </MotionDiv>
        </AnimatePresence>
      </main>
    </div>
  );
}
