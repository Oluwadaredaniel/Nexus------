
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Layers, Building2, Search, Split } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function ManageDepartments() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/faculties');
      setFaculties(res.data);
    } catch (e) { console.error(e); }
  };

  // Flatten departments for display
  const allDepartments = faculties.flatMap(f => 
    f.departments.map((d: any) => ({
      ...d,
      facultyName: f.name,
      facultyId: f._id
    }))
  ).filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.facultyName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Departments</h2>
          <p className="text-muted-foreground">Global view of all departments and their tracks.</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
           <div className="relative">
             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
             <input 
               placeholder="Search Department or Faculty..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-10 p-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary"
             />
           </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {allDepartments.map((dept, i) => (
               <MotionDiv 
                 key={dept._id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
               >
                 <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                   <Building2 className="h-3 w-3" />
                   {dept.facultyName}
                 </div>
                 <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                   <Layers className="h-5 w-5 text-primary" />
                   {dept.name}
                 </h3>
                 
                 {dept.options && dept.options.length > 0 ? (
                   <div className="flex flex-wrap gap-1 mt-3">
                     {dept.options.map((opt: any) => (
                       <span key={opt._id} className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground border border-white/5">
                         {opt.name}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-xs text-muted-foreground italic mt-3">No specific options/tracks</p>
                 )}
               </MotionDiv>
             ))}
             {allDepartments.length === 0 && (
               <div className="col-span-full text-center py-10 text-muted-foreground">
                 No departments found matching your search.
               </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
