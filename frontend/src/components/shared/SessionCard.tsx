
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Wifi, Clock, MapPin, CheckCircle2, StopCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SessionCardProps {
  session: any;
  role: 'student' | 'rep' | 'admin';
  onAction?: (id: string) => void;
  actionLabel?: string;
  isActionLoading?: boolean;
}

export default function SessionCard({ session, role, onAction, actionLabel, isActionLoading }: SessionCardProps) {
  const isExpired = new Date() > new Date(session.endTime);
  const isActive = session.isActive && !isExpired;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`border-0 overflow-hidden relative shadow-xl transition-all duration-300 hover:scale-[1.01] ${isActive ? 'bg-gradient-to-br from-indigo-900/40 to-black border-l-4 border-l-indigo-500' : 'bg-card/40 border border-white/5 grayscale'}`}>
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2 py-1 rounded text-xs font-bold border ${isActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20' : 'bg-white/5 text-muted-foreground border-white/5'}`}>
              {session.course.code}
            </span>
            {isActive ? <Wifi className="h-5 w-5 text-indigo-500 animate-pulse" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
          </div>
          
          <h3 className={`text-xl font-bold mb-4 leading-tight ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
            {session.course.title}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ends: {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            {role !== 'student' && (
               <div className="flex items-center gap-2">
                 <MapPin className="h-4 w-4" />
                 <span>Code: <span className="font-mono text-white font-bold">{session.uniqueCode}</span></span>
               </div>
            )}
          </div>

          {onAction && (
            <Button 
              className={`w-full h-12 font-bold ${isActive ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary'}`} 
              onClick={() => onAction(session._id)}
              disabled={isActionLoading || (!isActive && role === 'student')}
            >
              {role === 'student' ? (
                 <><CheckCircle2 className="mr-2 h-5 w-5" /> Mark Present</>
              ) : (
                 <><StopCircle className="mr-2 h-5 w-5" /> {actionLabel || 'End Session'}</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
