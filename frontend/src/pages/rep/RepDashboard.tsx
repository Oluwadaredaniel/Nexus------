
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Wifi, GraduationCap, Play } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function RepDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real app, fetch specific rep stats
    // setStats(...)
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rep Overview</h2>
          <p className="text-muted-foreground">{user?.department} — Level {user?.level}</p>
        </div>
        <Button onClick={() => navigate('/rep/create-session')} className="h-12 px-6 shadow-lg shadow-primary/20">
           <Play className="mr-2 h-5 w-5" /> Start Session
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <Wifi className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Online</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/rep/students')}>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">My Class</CardTitle>
             <Users className="h-4 w-4 text-primary" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-white">View List</div>
           </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/history')}>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">My Attendance</CardTitle>
             <GraduationCap className="h-4 w-4 text-purple-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-white">History</div>
           </CardContent>
        </Card>
      </div>
      
      {/* Could add a Recent Sessions table here reusing SessionList logic or a truncated version */}
    </div>
  );
}
