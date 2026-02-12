"use client";
import { useState, useEffect, useRef } from "react";
import { 
  HardDrive, File, FileText, Music, Video, Image as ImageIcon, 
  MoreVertical, Star, Clock, Cloud, Menu, X, Plus, Search,
  ChevronRight, Settings, Download, Trash2, Shield, Grid, List, Eye
} from "lucide-react";

export default function Vault() {
  const [files, setFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [previewFile, setPreviewFile] = useState(null); // For Modal
  const [contextMenu, setContextMenu] = useState(null); // {x, y, fileId}
  const [storageUsed, setStorageUsed] = useState(0);
  const fileInputRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const saved = localStorage.getItem("soumo_vault_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFiles(parsed);
      calculateStorage(parsed);
    } else {
      // Restore "Pro" Mock Data
      const defaults = [
        { id: 1, name: "Mission_Report.pdf", type: "document", size: 2400, date: "2026-02-12", starred: true },
        { id: 2, name: "Neural_Net.json", type: "code", size: 14, date: "2026-02-11", starred: false },
        { id: 3, name: "Tokyo_City.jpg", type: "image", size: 4200, date: "2026-02-10", starred: false },
        { id: 4, name: "lofi_beats.mp3", type: "audio", size: 8500, date: "2026-02-09", starred: true },
      ];
      setFiles(defaults);
      calculateStorage(defaults);
    }
  }, []);

  // --- LOGIC CORE ---
  const calculateStorage = (data) => {
    const totalKB = data.reduce((acc, file) => acc + (file.size || 0), 0);
    setStorageUsed((totalKB / 1024).toFixed(1));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFile = {
      id: Date.now(),
      name: file.name,
      type: getFileType(file.type),
      size: (file.size / 1024).toFixed(0),
      date: new Date().toLocaleDateString(),
      starred: false
    };
    const updated = [newFile, ...files];
    setFiles(updated);
    calculateStorage(updated);
    localStorage.setItem("soumo_vault_data", JSON.stringify(updated));
    setSidebarOpen(false);
  };

  const getFileType = (mime) => {
    if (mime.includes('image')) return 'image';
    if (mime.includes('audio')) return 'audio';
    if (mime.includes('video')) return 'video';
    if (mime.includes('json') || mime.includes('javascript')) return 'code';
    return 'document';
  };

  const deleteFile = (id) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    calculateStorage(updated);
    localStorage.setItem("soumo_vault_data", JSON.stringify(updated));
    setContextMenu(null);
  };

  // --- RENDER HELPERS ---
  const filteredFiles = files.filter(f => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Starred") return f.starred;
    if (activeCategory === "Recent") return true; // Needs date sort logic
    if (activeCategory === "Media") return ['image', 'video', 'audio'].includes(f.type);
    return true;
  });

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col md:flex-row text-gray-300 font-sans relative overflow-hidden" onClick={() => setContextMenu(null)}>
      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />

      {/* 1. MOBILE HEADER */}
      <div className="md:hidden h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a] z-30 shrink-0">
        <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 active:bg-white/10 rounded-lg"><Menu size={20}/></button>
            <span className="font-bold text-white tracking-wide">Vault</span>
        </div>
        <button onClick={() => fileInputRef.current.click()} className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
             <Plus size={18}/>
        </button>
      </div>

      {/* 2. SIDEBAR (Glass Slide-out) */}
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`
        fixed md:relative z-50 top-0 left-0 h-full w-[260px] md:w-64 bg-[#0a0a0a] border-r border-white/5 
        transition-transform duration-300 md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-white/5 gap-3">
            <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center"><Cloud size={18}/></div>
            <span className="font-bold text-white text-lg">Vault</span>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <button onClick={() => fileInputRef.current.click()} className="w-full bg-white text-black py-2.5 rounded-lg font-bold text-sm mb-6 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Plus size={16}/> Upload New
            </button>
            {[
              {id: "All", icon: <HardDrive size={18}/>},
              {id: "Recent", icon: <Clock size={18}/>},
              {id: "Starred", icon: <Star size={18}/>},
              {id: "Media", icon: <ImageIcon size={18}/>}
            ].map(cat => (
                <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${activeCategory === cat.id ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-white/5'}`}>
                    {cat.icon} <span>{cat.id}</span>
                </button>
            ))}
        </div>

        {/* STORAGE BAR */}
        <div className="p-5 border-t border-white/5 bg-[#0f0f0f]">
            <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400">Storage</span>
                <span className="text-white font-bold">{storageUsed} MB <span className="text-gray-600">/ 1 GB</span></span>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[20%]"></div>
            </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
           
           {/* TOOLBAR */}
           <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
               <h1 className="text-xl font-bold text-white">{activeCategory} Files</h1>
               <div className="flex items-center gap-2">
                   <div className="hidden md:flex bg-[#111] border border-white/10 rounded-lg p-1">
                       <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><Grid size={16}/></button>
                       <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><List size={16}/></button>
                   </div>
               </div>
           </div>

           {/* FILE AREA */}
           <div className="flex-1 overflow-y-auto p-4 md:p-8">
               {filteredFiles.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-600">
                       <Cloud size={48} className="mb-4 opacity-20"/>
                       <p>No files found.</p>
                   </div>
               ) : (
                   <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3" : "flex flex-col gap-2"}>
                      {filteredFiles.map(file => (
                        <div key={file.id} 
                            onClick={() => setPreviewFile(file)}
                            onContextMenu={(e) => { e.preventDefault(); setContextMenu({x: e.clientX, y: e.clientY, id: file.id}); }}
                            className={`
                                group bg-[#0a0a0a] border border-white/5 hover:border-blue-500/50 hover:bg-[#111] transition-all cursor-pointer relative
                                ${viewMode === 'grid' ? 'p-4 rounded-xl flex flex-col items-center text-center gap-3 aspect-square justify-center' : 'p-3 rounded-lg flex items-center gap-4'}
                            `}
                        >
                            <div className={`w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0`}>
                                {file.type === 'image' ? <ImageIcon size={20}/> : file.type === 'audio' ? <Music size={20}/> : <FileText size={20}/>}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{file.name}</div>
                                <div className="text-[10px] text-gray-500">{file.size} KB</div>
                            </div>
                        </div>
                      ))}
                   </div>
               )}
               <div className="h-20"></div>
           </div>
      </div>

      {/* 4. PREVIEW MODAL (The Feature You Wanted) */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616]">
                    <span className="font-bold text-white truncate">{previewFile.name}</span>
                    <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 p-8 flex items-center justify-center bg-black/50 overflow-auto">
                    {previewFile.type === 'image' ? (
                        <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">Image Preview</div>
                    ) : (
                        <div className="text-center">
                            <FileText size={48} className="mx-auto mb-4 text-gray-600"/>
                            <p className="text-gray-400">Preview not available for this file type.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-white/10 flex gap-2 justify-end bg-[#161616]">
                    <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200">Download</button>
                </div>
            </div>
        </div>
      )}

      {/* 5. CONTEXT MENU (Right Click) */}
      {contextMenu && (
          <div className="fixed bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl w-40 py-1 z-50 flex flex-col" style={{top: contextMenu.y, left: contextMenu.x}}>
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"><Eye size={14}/> Open</button>
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"><Shield size={14}/> Encrypt</button>
              <div className="h-px bg-white/10 my-1"></div>
              <button onClick={() => deleteFile(contextMenu.id)} className="px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"><Trash2 size={14}/> Delete</button>
          </div>
      )}
    </div>
  );
}