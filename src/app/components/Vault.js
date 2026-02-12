"use client";
import { useState, useEffect, useRef } from "react";
import { 
  HardDrive, File, FileText, Music, Video, Image as ImageIcon, 
  MoreVertical, Star, Clock, Cloud, Menu, X, Plus, Search,
  ChevronRight, Settings, Download, Trash2, SortAsc
} from "lucide-react";

export default function Vault() {
  const [files, setFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const fileInputRef = useRef(null); // Ref for hidden input

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("soumo_vault_files");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFiles(parsed);
      calculateStorage(parsed);
    }
  }, []);

  const calculateStorage = (fileList) => {
    // Sum up file sizes (KB) and convert to MB for display
    const totalKB = fileList.reduce((acc, file) => acc + (file.size || 0), 0);
    setStorageUsed((totalKB / 1024).toFixed(2)); // Store as MB
  };

  // --- REAL UPLOAD LOGIC ---
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    const newFile = {
      id: Date.now(),
      name: uploadedFile.name,
      type: getFileType(uploadedFile.type),
      size: (uploadedFile.size / 1024).toFixed(0), // KB
      date: new Date().toLocaleDateString(),
      starred: false
    };

    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    calculateStorage(updatedFiles);
    localStorage.setItem("soumo_vault_files", JSON.stringify(updatedFiles));
    setSidebarOpen(false); // Close menu if open
  };

  const getFileType = (mimeType) => {
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    return 'document';
  };

  // --- DELETE LOGIC ---
  const deleteFile = (id) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    calculateStorage(updated);
    localStorage.setItem("soumo_vault_files", JSON.stringify(updated));
  };

  const categories = [
    { id: "All", icon: <HardDrive size={18}/>, label: "My Vault" },
    { id: "Recent", icon: <Clock size={18}/>, label: "Recent" },
    { id: "Starred", icon: <Star size={18}/>, label: "Starred" },
  ];

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col md:flex-row text-gray-300 font-sans relative overflow-hidden">
      
      {/* HIDDEN INPUT FOR UPLOADS */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* MOBILE HEADER */}
      <div className="md:hidden h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a] z-30">
        <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 active:bg-white/10 rounded-lg">
                <Menu size={24} className="text-white"/>
            </button>
            <span className="font-bold text-white text-lg">Vault</span>
        </div>
        <button 
            onClick={() => fileInputRef.current.click()} 
            className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"
        >
             <Plus size={20}/>
        </button>
      </div>

      {/* SIDEBAR (Adaptive) */}
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>

      <div className={`fixed md:relative z-50 top-0 left-0 h-full w-[280px] md:w-64 bg-[#0a0a0a] border-r border-white/5 transition-transform duration-300 md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden md:flex h-20 items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3 text-white font-bold text-xl">
            <Cloud size={18} className="text-blue-500"/>
            <span>Vault</span>
          </div>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm mb-6 flex items-center justify-center gap-2 shadow-lg"
            >
                <Plus size={16} strokeWidth={3}/> Upload File
            </button>

            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeCategory === cat.id ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-white/5'}`}
                >
                    {cat.icon}
                    <span>{cat.label}</span>
                </button>
            ))}

            {/* DYNAMIC STORAGE METER */}
            <div className="mt-8 bg-[#111] border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Storage</span>
                    <span className="text-white font-bold">{storageUsed} MB</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((storageUsed / 1024) * 100, 100)}%` }} // Assumes 1GB limit for visual
                    ></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Local System Storage</p>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
           <div className="flex-1 overflow-y-auto p-4 md:p-8">
               
               {/* SLIDER: Quick Access (Only if files exist) */}
               {files.length > 0 && (
                   <div className="mb-8">
                       <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider px-1">Quick Access</h3>
                       <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                           {files.slice(0, 5).map(file => (
                               <div key={file.id} className="min-w-[140px] bg-[#111] border border-white/5 p-4 rounded-xl">
                                   <div className={`w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3`}>
                                       {getFileIcon(file.type)}
                                   </div>
                                   <div className="text-xs font-bold text-white truncate">{file.name}</div>
                                   <div className="text-[10px] text-gray-500 mt-1">{file.size} KB</div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               <div className="mb-4 flex items-center justify-between px-1">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">All Files</h3>
                   <span className="text-[10px] text-gray-600">{files.length} items</span>
               </div>

               {files.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                       <Cloud size={48} className="mb-4"/>
                       <p>Vault is empty. Upload a file.</p>
                   </div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {files.map(file => (
                        <div key={file.id} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-xl flex items-center gap-3 relative group">
                            <div className={`w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0`}>
                                {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-200 truncate">{file.name}</div>
                                <div className="text-[10px] text-gray-500">{file.size} KB • {file.date}</div>
                            </div>
                            <button onClick={() => deleteFile(file.id)} className="p-2 text-gray-600 hover:text-red-400">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                      ))}
                   </div>
               )}
               <div className="h-24 md:h-0"></div>
           </div>
      </div>
    </div>
  );
}

function getFileIcon(type) {
    if (type === 'image') return <ImageIcon size={18} />;
    if (type === 'video') return <Video size={18} />;
    if (type === 'audio') return <Music size={18} />;
    return <FileText size={18} />;
}