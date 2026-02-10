
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, Building2, UserCog, User, Home, Radio, CheckCircle, ShieldAlert, BarChart, Layers, Menu, X, HelpCircle, Network, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import InstallPrompt from './InstallPrompt';
import OfflineBanner from './OfflineBanner';
import MatricNoModal from './MatricNoModal';

const MotionDiv = motion.div as any;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu whenever the route changes
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleProfileClick = () => {
    if (user?.role === 'super_admin') navigate('/admin/profile');
    else if (user?.role && user.role.includes('rep')) navigate('/rep/profile');
    else navigate('/student/profile');
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  const adminLinks = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Building2, label: "Faculties", path: "/admin/faculties" },
    { icon: Layers, label: "Departments", path: "/admin/departments" },
    { icon: BarChart, label: "Levels", path: "/admin/levels" },
    { icon: BookOpen, label: "Courses", path: "/admin/courses" },
    { icon: Network, label: "Integrations", path: "/admin/integrations" },
    { icon: Users, label: "Students", path: "/admin/students" },
    { icon: UserCog, label: "Reps", path: "/admin/reps" },
    { icon: ShieldAlert, label: "Admins", path: "/admin/admins" },
    { icon: Radio, label: "Sessions", path: "/admin/sessions" },
    { icon: Users, label: "Upload Lists", path: "/admin/class-lists" },
    { icon: CheckCircle, label: "Attendance", path: "/mark-attendance" },
    { icon: GraduationCap, label: "History", path: "/history" },
    { icon: HelpCircle, label: "User Manual", path: "/help" },
  ];

  const repLinks = [
    { icon: LayoutDashboard, label: "Dash", path: "/rep" },
    { icon: Radio, label: "Sessions", path: "/rep/sessions" },
    { icon: Users, label: "Class List", path: "/rep/students" },
    // Only show Team Management to Faculty Reps
    ...(user.role === 'faculty_rep' ? [{ icon: Shield, label: "Manage Team", path: "/rep/team" }] : []),
    { icon: CheckCircle, label: "Attendance", path: "/mark-attendance" },
    { icon: GraduationCap, label: "History", path: "/history" },
    { icon: User, label: "My Profile", path: "/rep/profile" },
    { icon: HelpCircle, label: "User Manual", path: "/help" },
  ];

  const studentLinks = [
    { icon: Home, label: "Home", path: "/student" },
    { icon: CheckCircle, label: "Attendance", path: "/mark-attendance" },
    { icon: GraduationCap, label: "History", path: "/history" },
    { icon: User, label: "ID Card", path: "/student/profile" },
    { icon: HelpCircle, label: "Help Guide", path: "/help" },
  ];

  let links = studentLinks;
  if (user.role === 'super_admin') links = adminLinks;
  else if (user.role && user.role.includes('rep')) links = repLinks;

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={`flex items-center gap-3 mb-8 cursor-pointer group ${mobile ? 'px-2' : ''}`} onClick={() => navigate('/')}>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
          <span className="font-bold text-white text-xl">N</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-none text-white">NEXUS</h1>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Academic Suite</span>
        </div>
      </div>
      
      <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar pr-2 flex-1">
        {links.map((link) => (
          <Button
            key={link.path}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-300 relative overflow-hidden",
              location.pathname === link.path && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold shadow-[0_0_20px_-10px_rgba(139,92,246,0.5)]"
            )}
            onClick={() => { navigate(link.path); if (mobile) setIsMobileMenuOpen(false); }}
          >
            {location.pathname === link.path && (
              <MotionDiv layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
            )}
            <link.icon className={cn("h-4 w-4 transition-transform duration-300", location.pathname === link.path && "scale-110")} />
            {link.label}
          </Button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5">
        <div 
          className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/5" 
          onClick={handleProfileClick}
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-inner ring-2 ring-black">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-white">{user.name || 'User'}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-semibold">{user.role?.replace('_', ' ') || 'Student'}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 group transition-all" onClick={handleLogout}>
          <LogOut className="h-3 w-3 group-hover:text-red-400 transition-colors" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/20 font-sans">
      <div className="absolute inset-0 bg-[url('/bg-grain.png')] opacity-15 pointer-events-none z-0 mix-blend-overlay" />
      <OfflineBanner />
      <InstallPrompt />
      <MatricNoModal />

      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl hidden md:flex flex-col relative z-20 p-6">
        <NavContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-4 transition-all">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-sm">N</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">NEXUS</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm md:hidden cursor-pointer" 
            />
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              className="fixed inset-y-0 left-0 z-[101] w-72 bg-[#09090b] border-r border-white/10 p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-white/10 rounded-full">
                  <X className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
                </Button>
              </div>
              <NavContent mobile={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <MotionDiv key={location.pathname} initial={{ opacity: 0, y: 15, scale: 0.98, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, scale: 0.98, filter: 'blur(8px)' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="p-4 md:p-8 max-w-7xl mx-auto min-h-full pb-24">
            <Outlet />
          </MotionDiv>
        </AnimatePresence>
      </main>
    </div>
  );
}