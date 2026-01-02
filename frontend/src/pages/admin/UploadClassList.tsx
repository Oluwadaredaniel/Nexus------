
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function UploadClassList() {
  const [meta, setMeta] = useState<{ faculties: any[], levels: any[] }>({ faculties: [], levels: [] });
  const [file, setFile] = useState<any>(null);
  const [ctx, setCtx] = useState({ faculty: '', department: '', level: '', option: '' });
  
  useEffect(() => { api.get('/admin/faculties').then(f => api.get('/admin/levels').then(l => setMeta({ faculties: f.data, levels: l.data }))); }, []);
  
  const handleUpload = async () => {
    if (!file || !ctx.faculty || !ctx.department || !ctx.level) return toast.error('Missing fields');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = XLSX.utils.sheet_to_json(XLSX.read(e.target?.result, { type: 'binary' }).Sheets[XLSX.read(e.target?.result, { type: 'binary' }).SheetNames[0]]);
      try {
        await api.post('/admin/upload-classlist', { students: data, context: ctx });
        toast.success('Uploaded successfully');
      } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    reader.readAsBinaryString(file);
  };

  const departments = meta.faculties.find((f: any) => f.name === ctx.faculty)?.departments || [];
  const options = departments.find((d: any) => d.name === ctx.department)?.options || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-white">Upload Class List</h2>
      <div className="glass-card p-8 rounded-3xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <select onChange={e => setCtx({ ...ctx, faculty: e.target.value })} className="p-3 bg-black/20 rounded-xl text-zinc-300 border border-white/10">
            <option value="">Select Faculty</option>
            {meta.faculties.map((f: any) => <option key={f._id} value={f.name}>{f.name}</option>)}
          </select>
          <select onChange={e => setCtx({ ...ctx, department: e.target.value })} className="p-3 bg-black/20 rounded-xl text-zinc-300 border border-white/10">
            <option value="">Select Dept</option>
            {departments.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        {options.length > 0 && (
          <select onChange={e => setCtx({ ...ctx, option: e.target.value })} className="w-full p-3 bg-black/20 rounded-xl text-zinc-300 border border-white/10">
            <option value="">Select Option</option>
            {options.map((o: any) => <option key={o._id} value={o.name}>{o.name}</option>)}
          </select>
        )}
        <select onChange={e => setCtx({ ...ctx, level: e.target.value })} className="w-full p-3 bg-black/20 rounded-xl text-zinc-300 border border-white/10">
          <option value="">Select Level</option>
          {meta.levels.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
        </select>
        <input type="file" onChange={e => setFile(e.target.files?.[0])} className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-zinc-400" />
        <button onClick={handleUpload} className="w-full py-3 bg-primary rounded-xl font-bold text-white">Process Upload</button>
      </div>
    </div>
  );
}
