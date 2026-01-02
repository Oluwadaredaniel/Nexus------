
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Upload, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function UploadClassList() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  
  // Context State
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDeptData, setSelectedDeptData] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Derived Departments based on selected Faculty
  const departments = faculties.find(f => f.name === selectedFaculty)?.departments || [];
  
  // Check if selected department has options
  const hasOptions = selectedDeptData?.options && selectedDeptData.options.length > 0;

  useEffect(() => {
    const fetchMeta = async () => {
       try {
         const [facRes, levRes] = await Promise.all([
           api.get('/admin/faculties'),
           api.get('/admin/levels')
         ]);
         setFaculties(facRes.data);
         setLevels(levRes.data);
       } catch(e) { console.error(e); }
    };
    fetchMeta();
  }, []);

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptName = e.target.value;
    setSelectedDept(deptName);
    const deptData = departments.find((d: any) => d.name === deptName);
    setSelectedDeptData(deptData);
    setSelectedOption(''); // Reset option
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // strict validation
    if (!selectedFaculty || !selectedDept || !selectedLevel) {
       toast.error('Missing context');
       return;
    }
    if (hasOptions && !selectedOption) {
      toast.error('Please select an Option/Track');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      await uploadData(data);
    };
    reader.readAsBinaryString(file);
  };

  const uploadData = async (data: any[]) => {
    setLoading(true);
    try {
      const payload = {
         students: data,
         context: {
            faculty: selectedFaculty,
            department: selectedDept,
            level: selectedLevel,
            option: hasOptions ? selectedOption : null
         }
      };

      await api.post('/admin/upload-classlist', payload);
      toast.success(`Successfully uploaded class list for ${selectedDept}`);
      // Reset
      setStep(1);
      setSelectedFaculty('');
      setSelectedDept('');
      setSelectedLevel('');
      setSelectedOption('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload class list');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToUpload = selectedFaculty && selectedDept && selectedLevel && (!hasOptions || selectedOption);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Class List</CardTitle>
        <p className="text-muted-foreground text-sm">Follow the steps to bind students to the correct academic context.</p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Step 1: Context Selection */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-medium mb-1.5 block">1. Faculty</label>
               <select 
                 className="w-full p-2.5 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                 value={selectedFaculty}
                 onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedDept(''); setSelectedOption(''); }}
               >
                 <option value="">Select Faculty</option>
                 {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
               </select>
             </div>
             
             <div>
               <label className="text-sm font-medium mb-1.5 block">2. Department</label>
               <select 
                 className="w-full p-2.5 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                 value={selectedDept}
                 onChange={handleDeptChange}
                 disabled={!selectedFaculty}
               >
                 <option value="">Select Department</option>
                 {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
               </select>
             </div>
          </div>

          <AnimatePresence>
            {hasOptions && (
              <MotionDiv 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                 <label className="text-sm font-medium mb-1.5 block text-primary">3. Option / Track</label>
                 <select 
                   className="w-full p-2.5 rounded-lg bg-secondary border border-primary/50 focus:ring-2 focus:ring-primary outline-none"
                   value={selectedOption}
                   onChange={(e) => setSelectedOption(e.target.value)}
                 >
                   <option value="">Select Option</option>
                   {selectedDeptData.options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                 </select>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div>
             <label className="text-sm font-medium mb-1.5 block">4. Level</label>
             <select 
               className="w-full p-2.5 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
               value={selectedLevel}
               onChange={(e) => setSelectedLevel(e.target.value)}
             >
               <option value="">Select Level</option>
               {levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
             </select>
           </div>
        </div>

        {/* Step 2: Upload Area */}
        <div className={`p-8 border-2 border-dashed rounded-xl text-center transition-all duration-300 ${canProceedToUpload ? 'border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border opacity-50 cursor-not-allowed'}`}>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            className="hidden" 
            id="file-upload" 
            disabled={!canProceedToUpload || loading}
          />
          <label htmlFor="file-upload" className={`flex flex-col items-center ${canProceedToUpload ? 'cursor-pointer' : ''}`}>
            <Upload className={`h-12 w-12 mb-4 ${canProceedToUpload ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-lg font-bold">Upload Excel File</div>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
               Required Columns: <strong>RegNo, Name</strong> ONLY.
               <br />
               Faculty, Dept, Level, & Option will be applied from your selection above.
            </p>
          </label>
        </div>

        {loading && (
           <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
             <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
             <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-75" />
             <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150" />
             Processing Class List...
           </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-yellow-500">Important Note</h4>
            <p className="text-xs text-yellow-200/80">
              This upload defines the <strong>Source of Truth</strong>. Students can only sign up if their registration number exists in this list under the <strong>exact context</strong> selected above.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
