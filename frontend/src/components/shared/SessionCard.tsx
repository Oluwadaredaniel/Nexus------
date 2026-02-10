
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Wifi, Clock, MapPin, CheckCircle2, StopCircle, Download, FileText, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export interface SessionCardProps {
  session: any;
  role: 'student' | 'rep' | 'admin';
  onAction?: (id: string) => void | Promise<void>;
  onExport?: (id: string, type: 'pdf' | 'xlsx') => void;
  actionLabel?: string;
  isActionLoading?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, role, onAction, onExport, actionLabel, isActionLoading }) => {
  const isExpired = new Date() > new Date(session.endTime);
  const isActive = session.isActive && !isExpired;

  const displayCode = session.course?.code || (session.type === 'GENERAL' ? 'GEN' : 'EVENT');
  const displayTitle = session.course?.title || session.title || 'Untitled Session';

  return (
    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`border-0 overflow-hidden relative shadow-xl transition-all duration-300 hover:scale-[1.01] ${isActive ? 'bg-gradient-to-br from-indigo-900/40 to-black border-l-4 border-l-indigo-500' : 'bg-card/40 border border-white/5'}`}>
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2 py-1 rounded text-xs font-bold border ${isActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20' : 'bg-white/5 text-muted-foreground border-white/5'}`}>
              {displayCode}
            </span>
            {isActive ? <Wifi className="h-5 w-5 text-indigo-500 animate-pulse" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
          </div>
          
          <h3 className={`text-xl font-bold mb-4 leading-tight ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
            {displayTitle}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{isActive ? 'Ends' : 'Ended'}: {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            {role !== 'student' && (
               <div className="flex items-center gap-2">
                 <MapPin className="h-4 w-4" />
                 <span>Code: <span className="font-mono text-white font-bold">{session.uniqueCode}</span></span>
               </div>
            )}
            {!isActive && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-4 w-4" />
                <span>Date: {formatDate(session.startTime).split(',')[0]}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isActive && onAction ? (
              <Button 
                className={`w-full h-11 font-bold ${isActive ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary'}`} 
                onClick={() => onAction(session._id)}
                disabled={isActionLoading || (!isActive && role === 'student')}
              >
                {role === 'student' ? (
                   <><CheckCircle2 className="mr-2 h-5 w-5" /> Mark Present</>
                ) : (
                   <><StopCircle className="mr-2 h-5 w-5" /> {actionLabel || 'End Session'}</>
                )}
              </Button>
            ) : !isActive && role === 'rep' && onExport ? (
              <>
                <Button variant="outline" className="flex-1 h-10 border-white/10 hover:bg-white/5" onClick={() => onExport(session._id, 'xlsx')}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" className="flex-1 h-10 border-white/10 hover:bg-white/5" onClick={() => onExport(session._id, 'pdf')}>
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};

export default SessionCard;