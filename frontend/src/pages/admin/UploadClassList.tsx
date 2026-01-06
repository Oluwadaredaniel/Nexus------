
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Upload, AlertCircle, Layers, Users, BookOpen, Download, FileSpreadsheet, Trash2, X, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function UploadClassList() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  
  // Context State
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDeptData, setSelectedDeptData] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // File Preview State
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);

  // Ref for file input
  const eRef = useRef<HTMLInputElement>(null);

  const departments = faculties.find(f => f.name === selectedFaculty)?.departments || [];
  const hasOptions = selectedDeptData?.options && selectedDeptData.options.length > 0;

  useEffect(() => {
    fetchMeta();
    fetchSummaries();
  }, []);

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

  const fetchSummaries = async () => {
    try {
      const res = await api.get('/admin/classlist-summaries');
      setSummaries(res.data);
    } catch(e) { console.error(e); }
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptName = e.target.value;
    setSelectedDept(deptName);
    const deptData = departments.find((d: any) => d.name === deptName);
    setSelectedDeptData(deptData);
    setSelectedOption(''); 
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { RegNo: "CSC/2024/001", Name: "Adewale Johnson" },
      { RegNo: "CSC/2024/002", Name: "Sarah Connor" },
      { RegNo: "CSC/2024/003", Name: "Ibrahim Musa" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassList_Template");
    XLSX.writeFile(wb, "Nexus_ClassList_Template.xlsx");
  };

  const normalizeHeaders = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    const headers = Object.keys(firstRow);
    setDetectedHeaders(headers);

    return data.map(row => {
      const newRow: any = {};
      headers.forEach(key => {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const val = String(row[key] || '').trim();
        
        // Robust Mapping Logic
        const regKeywords = ['reg', 'matric', 'jamb', 'admission', 'identity', 'no', 'id'];
        const nameKeywords = ['name', 'full', 'student', 'fullname'];

        const isReg = regKeywords.some(k => cleanKey.includes(k));
        const isName = nameKeywords.some(k => cleanKey.includes(k));

        if (isReg && !newRow.regNo) {
          newRow.regNo = val;
        } else if (isName && !newRow.name) {
          newRow.name = val;
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const normalizedData = normalizeHeaders(rawData);
        const validRows = normalizedData.filter((r: any) => r.regNo && r.name && r.regNo.length > 2);

        if (validRows.length === 0) {
          // Keep detectedHeaders so the UI shows what we found
          setFile(null);
          return;
        }

        setPreviewData(validRows);
        setFile(file);
        setDetectedHeaders([]); // Clear error state on success
        toast.success(`Detected ${validRows.length} students`);
      } catch (err) {
        console.error(err);
        toast.error('Error parsing Excel file.');
        setFile(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!canProceedToUpload) {
      toast.error('Select Faculty, Dept and Level first.');
      return;
    }
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setUploadProgress(0);
    setDetectedHeaders([]);
    if (eRef.current) eRef.current.value = "";
  };

  const uploadData = async () => {
    if (!previewData.length) return;
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const payload = {
         students: previewData,
         context: {
            faculty: selectedFaculty,
            department: selectedDept,
            level: selectedLevel,
            option: hasOptions ? selectedOption : null
         }
      };

      const res = await api.post('/admin/upload-classlist', payload, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      toast.success(res.data.message || `Uploaded ${previewData.length} students`);
      clearFile();
      fetchSummaries();
    } catch (err: any) {
      console.error("Upload Error:", err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (item: any) => {
    const confirmMsg = `Delete the class list for ${item._id.department} Level ${item._id.level}?`;
    if (!window.confirm(confirmMsg)) return;

    const params = new URLSearchParams({
      faculty: item._id.faculty,
      department: item._id.department,
      level: item._id.level,
      option: item._id.option || 'null'
    });

    try {
      await api.delete(`/admin/class-lists?${params.toString()}`);
      toast.success('Deleted');
      fetchSummaries();
    } catch(e) { toast.error('Failed to delete'); }
  };

  const canProceedToUpload = selectedFaculty && selectedDept && selectedLevel && (!hasOptions || selectedOption);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Class List Management</h2>
          <p className="text-muted-foreground">Import and manage student cohorts.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2 border-white/10 hover:bg-white/5">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Template
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="h-5 w-5 text-primary" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Faculty</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                     value={selectedFaculty}
                     onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedDept(''); setSelectedOption(''); }}
                   >
                     <option value="">-- Faculty --</option>
                     {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                   </select>
                 </div>
                 
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Department</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                     value={selectedDept}
                     onChange={handleDeptChange}
                     disabled={!selectedFaculty}
                   >
                     <option value="">-- Department --</option>
                     {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                   </select>
                 </div>

                 <AnimatePresence>
                   {hasOptions && (
                     <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 mb-1 block">Option / Track</label>
                        <select 
                          className="w-full p-3 rounded-xl bg-zinc-900 border border-primary/50 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                        >
                          <option value="">-- Option --</option>
                          {selectedDeptData.options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                        </select>
                     </MotionDiv>
                   )}
                 </AnimatePresence>

                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Level</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                     value={selectedLevel}
                     onChange={(e) => setSelectedLevel(e.target.value)}
                   >
                     <option value="">-- Level --</option>
                     {levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
                   </select>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                {!file ? (
                  <>
                    <div 
                      className={`relative p-10 border-2 border-dashed rounded-3xl text-center transition-all duration-300 ${
                        canProceedToUpload 
                          ? (isDragOver ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-white/10 bg-white/5 hover:border-primary/50 cursor-pointer') 
                          : 'border-white/5 opacity-40 cursor-not-allowed'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                    >
                      <input 
                        ref={eRef}
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        id="file-upload" 
                        disabled={!canProceedToUpload}
                      />
                      <label htmlFor="file-upload" className={`flex flex-col items-center ${canProceedToUpload ? 'cursor-pointer' : ''}`}>
                        <div className="h-16 w-16 bg-black/40 rounded-full flex items-center justify-center mb-4 border border-white/10">
                          <Upload className={`h-8 w-8 ${canProceedToUpload ? 'text-primary' : 'text-zinc-600'}`} />
                        </div>
                        <div className="font-bold text-white mb-1">
                          {canProceedToUpload ? "Drop Excel List Here" : "Complete Context Above"}
                        </div>
                        <p className="text-xs text-muted-foreground">Supports: JAMB Reg, Full Name, Matric No, etc.</p>
                      </label>
                    </div>

                    {detectedHeaders.length > 0 && (
                      <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2 font-bold text-red-400 text-sm">
                          <AlertTriangle className="h-4 w-4" /> Header Detection Failed
                        </div>
                        <p className="text-xs text-red-200/70 mb-3">We couldn't identify the required 'RegNo' and 'Name' columns. Found these headers:</p>
                        <div className="flex flex-wrap gap-2">
                          {detectedHeaders.map((h, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-black border border-white/5 text-[10px] font-mono text-zinc-400">{h}</span>
                          ))}
                        </div>
                      </MotionDiv>
                    )}
                  </>
                ) : (
                  <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                        <div>
                          <div className="font-bold text-white text-sm truncate max-w-[200px]">{file.name}</div>
                          <div className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-widest">{previewData.length} valid entries</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={clearFile} disabled={loading} className="hover:bg-red-500/20">
                        <X className="h-5 w-5 text-zinc-400" />
                      </Button>
                    </div>

                    <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-white/5 text-muted-foreground uppercase sticky top-0 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Identifier (Reg/JAMB)</th>
                            <th className="px-4 py-3">Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {previewData.slice(0, 50).map((row, i) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                              <td className="px-4 py-2 font-mono text-white">{row.regNo}</td>
                              <td className="px-4 py-2 text-zinc-300">{row.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-2">
                      {loading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-emerald-500" /> Synchronizing...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <Button variant="ghost" onClick={clearFile} className="text-zinc-500">Cancel</Button>
                          <Button onClick={uploadData} className="px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                            Finalize Import
                          </Button>
                        </div>
                      )}
                    </div>
                  </MotionDiv>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-zinc-400" /> Active Cohorts
          </h3>
          <div className="grid gap-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
            {summaries.map((item, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-sm truncate max-w-[150px]">{item._id.department}</h4>
                  <button onClick={() => handleDeleteList(item)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">{item._id.faculty}</div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-primary/20">
                     <Users className="h-3 w-3" /> {item.studentCount}
                   </div>
                   <div className="text-[10px] text-zinc-600 ml-auto">
                     Updated {new Date(item.lastUpdated).toLocaleDateString()}
                   </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                   <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white font-medium">{item._id.level} Lvl</span>
                   {item._id.option && (
                     <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-medium truncate max-w-[100px]">{item._id.option}</span>
                   )}
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
