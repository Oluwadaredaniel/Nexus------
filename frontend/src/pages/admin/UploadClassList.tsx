
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Upload, AlertCircle, Layers, Users, BookOpen, Download, FileSpreadsheet, Trash2, X, CheckCircle2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export default function UploadClassList() {
  const [loading, setLoading] = useState(false);
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
    return data.map(row => {
      const newRow: any = {};
      Object.keys(row).forEach(key => {
        // Normalize key: remove spaces, lowercase, remove special chars
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Map common variations to standard keys
        if (['regno', 'matricno', 'matriculationnumber', 'registrationnumber', 'id', 'studentno'].includes(cleanKey)) {
          newRow.regNo = String(row[key]).trim();
        } else if (['name', 'fullname', 'studentname', 'names'].includes(cleanKey)) {
          newRow.name = String(row[key]).trim();
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
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        const normalizedData = normalizeHeaders(rawData);
        const validRows = normalizedData.filter((r: any) => r.regNo && r.name);

        if (validRows.length === 0) {
          toast.error('No valid rows found. Ensure columns "RegNo" and "Name" exist.');
          setFile(null);
          return;
        }

        setPreviewData(validRows);
        setFile(file);
        toast.success(`Found ${validRows.length} valid entries`);
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
      toast.error('Please select Faculty, Department and Level first.');
      return;
    }
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    if (eRef.current) eRef.current.value = "";
  };

  const uploadData = async () => {
    if (!previewData.length) return;
    setLoading(true);
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

      const res = await api.post('/admin/upload-classlist', payload);
      toast.success(res.data.message || `Uploaded ${previewData.length} students`);
      
      // Reset
      clearFile();
      fetchSummaries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload class list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (item: any) => {
    const confirmMsg = `Are you sure you want to delete the ENTIRE class list for:\n\nDept: ${item._id.department}\nLevel: ${item._id.level}\n${item._id.option ? 'Option: '+item._id.option : ''}\n\nThis will remove ${item.studentCount} students from the roster.`;
    if (!window.confirm(confirmMsg)) return;

    const params = new URLSearchParams({
      faculty: item._id.faculty,
      department: item._id.department,
      level: item._id.level,
      option: item._id.option || 'null'
    });

    try {
      await api.delete(`/admin/class-lists?${params.toString()}`);
      toast.success('Class list deleted');
      fetchSummaries();
    } catch(e) {
      toast.error('Failed to delete class list');
    }
  };

  const canProceedToUpload = selectedFaculty && selectedDept && selectedLevel && (!hasOptions || selectedOption);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class List Management</h2>
          <p className="text-muted-foreground">Manage student data and cohort sources.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2 border-white/10 hover:bg-white/5">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Download Template
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Upload Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-primary/20 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Context Selectors */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Faculty</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                     value={selectedFaculty}
                     onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedDept(''); setSelectedOption(''); }}
                   >
                     <option value="">-- Select Faculty --</option>
                     {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                   </select>
                 </div>
                 
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Department</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                     value={selectedDept}
                     onChange={handleDeptChange}
                     disabled={!selectedFaculty}
                   >
                     <option value="">-- Select Department --</option>
                     {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                   </select>
                 </div>

                 {hasOptions && (
                   <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="col-span-2 md:col-span-1">
                      <label className="text-xs font-medium uppercase tracking-wider text-primary ml-1">Option / Track</label>
                      <select 
                        className="w-full p-3 rounded-xl bg-zinc-900 border border-primary/50 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                      >
                        <option value="">-- Select Option --</option>
                        {selectedDeptData.options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                      </select>
                   </MotionDiv>
                 )}

                 <div className="col-span-2 md:col-span-1">
                   <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Level</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                     value={selectedLevel}
                     onChange={(e) => setSelectedLevel(e.target.value)}
                   >
                     <option value="">-- Select Level --</option>
                     {levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
                   </select>
                 </div>
              </div>

              {/* Upload / Preview Area */}
              <div className="pt-4 border-t border-white/5">
                {!file ? (
                  <div 
                    className={`relative p-10 border-2 border-dashed rounded-3xl text-center transition-all duration-300 ${
                      canProceedToUpload 
                        ? (isDragOver ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 cursor-pointer') 
                        : 'border-white/5 opacity-50 cursor-not-allowed'
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
                    <label htmlFor="file-upload" className={`flex flex-col items-center w-full h-full ${canProceedToUpload ? 'cursor-pointer' : ''}`}>
                      <div className="h-16 w-16 bg-black/40 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-lg">
                        <Upload className={`h-8 w-8 ${canProceedToUpload ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="font-bold text-lg text-white mb-1">
                        {canProceedToUpload ? "Click or Drag Excel File" : "Select Context First"}
                      </div>
                      <p className="text-sm text-muted-foreground">Supported: .xlsx, .xls (Columns: RegNo, Name)</p>
                    </label>
                  </div>
                ) : (
                  <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* File Info Bar */}
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{file.name}</div>
                          <div className="text-xs text-emerald-400 font-mono">{(file.size / 1024).toFixed(1)} KB • {previewData.length} Students</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={clearFile} className="hover:bg-red-500/20 hover:text-red-400">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Preview Table */}
                    <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-muted-foreground text-xs uppercase sticky top-0 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Reg No</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {previewData.slice(0, 100).map((row, i) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="px-4 py-2 text-muted-foreground text-xs">{i + 1}</td>
                              <td className="px-4 py-2 font-mono text-white">{row.regNo}</td>
                              <td className="px-4 py-2 text-zinc-300">{row.name}</td>
                              <td className="px-4 py-2">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              </td>
                            </tr>
                          ))}
                          {previewData.length > 100 && (
                            <tr><td colSpan={4} className="text-center py-2 text-xs text-muted-foreground">...and {previewData.length - 100} more</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="ghost" onClick={clearFile}>Cancel</Button>
                      <Button onClick={uploadData} disabled={loading} className="px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                        {loading ? 'Processing...' : `Confirm Upload (${previewData.length})`}
                      </Button>
                    </div>
                  </MotionDiv>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summaries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-zinc-400" /> Existing Cohorts
             </h3>
             <span className="text-xs text-muted-foreground">{summaries.length} Lists Found</span>
          </div>
          
          <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {summaries.map((item, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item._id.department}</h4>
                    <p className="text-xs text-muted-foreground">{item._id.faculty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-primary/20">
                      <Users className="h-3 w-3" /> {item.studentCount}
                    </div>
                    <button 
                      onClick={() => handleDeleteList(item)}
                      className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                      title="Delete this class list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2 pt-2 border-t border-white/5">
                  <span className="bg-white/10 text-white px-2 py-0.5 rounded">{item._id.level} Level</span>
                  {item._id.option && (
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded truncate max-w-[150px]">{item._id.option}</span>
                  )}
                  <span className="ml-auto">Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                </div>
              </MotionDiv>
            ))}
            {summaries.length === 0 && (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No class lists uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
        }dLevel}
                   onChange={(e) => setSelectedLevel(e.target.value)}
                 >
                   <option value="">-- Select Level --</option>
                   {levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
                 </select>
               </div>
            </div>

            <div className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all duration-300 ${canProceedToUpload ? 'border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-white/10 opacity-50 cursor-not-allowed'}`}>
              <input 
                ref={eRef}
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="file-upload" 
                disabled={!canProceedToUpload || loading}
              />
              <label htmlFor="file-upload" className={`flex flex-col items-center ${canProceedToUpload ? 'cursor-pointer' : ''}`}>
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-primary animate-pulse">
                    <Layers className="h-8 w-8 animate-bounce" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Upload className={`h-8 w-8 mb-2 ${canProceedToUpload ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="font-semibold text-white">Select Excel File</div>
                    <p className="text-xs text-muted-foreground mt-1">Columns: RegNo, Name</p>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Summaries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-zinc-400" /> Existing Cohorts
             </h3>
             <span className="text-xs text-muted-foreground">{summaries.length} Lists Found</span>
          </div>
          
          <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {summaries.map((item, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item._id.department}</h4>
                    <p className="text-xs text-muted-foreground">{item._id.faculty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-primary/20">
                      <Users className="h-3 w-3" /> {item.studentCount}
                    </div>
                    <button 
                      onClick={() => handleDeleteList(item)}
                      className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                      title="Delete this class list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2 pt-2 border-t border-white/5">
                  <span className="bg-white/10 text-white px-2 py-0.5 rounded">{item._id.level} Level</span>
                  {item._id.option && (
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded truncate max-w-[150px]">{item._id.option}</span>
                  )}
                  <span className="ml-auto">Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                </div>
              </MotionDiv>
            ))}
            {summaries.length === 0 && (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No class lists uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
              }        if (['regno', 'matricno', 'matriculationnumber', 'registrationnumber', 'id', 'studentno'].includes(cleanKey)) {
          newRow.regNo = String(row[key]).trim();
        } else if (['name', 'fullname', 'studentname', 'names'].includes(cleanKey)) {
          newRow.name = String(row[key]).trim();
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        // Normalize Data
        const normalizedData = normalizeHeaders(rawData);
        const validRows = normalizedData.filter((r: any) => r.regNo && r.name);

        if (validRows.length === 0) {
          toast.error('No valid rows found. Ensure columns "RegNo" and "Name" exist.');
          return;
        }

        console.log(`Found ${validRows.length} valid students`, validRows[0]);
        await uploadData(validRows);
      } catch (err) {
        console.error(err);
        toast.error('Error parsing Excel file.');
      }
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

      const res = await api.post('/admin/upload-classlist', payload);
      toast.success(res.data.message || `Uploaded ${data.length} students`);
      
      // Reset & Refresh
      setStep(1);
      if (eRef.current) eRef.current.value = ""; // Clear file input
      fetchSummaries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload class list');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToUpload = selectedFaculty && selectedDept && selectedLevel && (!hasOptions || selectedOption);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class List Management</h2>
          <p className="text-muted-foreground">Manage student data and cohort sources.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2 border-white/10 hover:bg-white/5">
          <FileSpreadsheet className="h-4 w-4 text-green-500" /> Download Template
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Upload Card */}
        <Card className="glass-card border-primary/20 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Upload New List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
               <div>
                 <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Faculty</label>
                 <select 
                   className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                   value={selectedFaculty}
                   onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedDept(''); setSelectedOption(''); }}
                 >
                   <option value="">-- Select Faculty --</option>
                   {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                 </select>
               </div>
               
               <div>
                 <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Department</label>
                 <select 
                   className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                   value={selectedDept}
                   onChange={handleDeptChange}
                   disabled={!selectedFaculty}
                 >
                   <option value="">-- Select Department --</option>
                   {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                 </select>
               </div>

               {hasOptions && (
                 <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-xs font-medium uppercase tracking-wider text-primary ml-1">Option / Track</label>
                    <select 
                      className="w-full p-3 rounded-xl bg-zinc-900 border border-primary/50 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    >
                      <option value="">-- Select Option --</option>
                      {selectedDeptData.options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
                    </select>
                 </MotionDiv>
               )}

               <div>
                 <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Level</label>
                 <select 
                   className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-primary outline-none text-white appearance-none"
                   value={selectedLevel}
                   onChange={(e) => setSelectedLevel(e.target.value)}
                 >
                   <option value="">-- Select Level --</option>
                   {levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
                 </select>
               </div>
            </div>

            <div className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all duration-300 ${canProceedToUpload ? 'border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-white/10 opacity-50 cursor-not-allowed'}`}>
              <input 
                ref={eRef}
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="file-upload" 
                disabled={!canProceedToUpload || loading}
              />
              <label htmlFor="file-upload" className={`flex flex-col items-center ${canProceedToUpload ? 'cursor-pointer' : ''}`}>
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-primary animate-pulse">
                    <Layers className="h-8 w-8 animate-bounce" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Upload className={`h-8 w-8 mb-2 ${canProceedToUpload ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="font-semibold text-white">Select Excel File</div>
                    <p className="text-xs text-muted-foreground mt-1">Columns: RegNo, Name</p>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Summaries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-zinc-400" /> Existing Cohorts
             </h3>
             <span className="text-xs text-muted-foreground">{summaries.length} Lists Found</span>
          </div>
          
          <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {summaries.map((item, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item._id.department}</h4>
                    <p className="text-xs text-muted-foreground">{item._id.faculty}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-primary/20">
                      <Users className="h-3 w-3" /> {item.studentCount}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2 pt-2 border-t border-white/5">
                  <span className="bg-white/10 text-white px-2 py-0.5 rounded">{item._id.level} Level</span>
                  {item._id.option && (
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded truncate max-w-[150px]">{item._id.option}</span>
                  )}
                  <span className="ml-auto">Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                </div>
              </MotionDiv>
            ))}
            {summaries.length === 0 && (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No class lists uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
