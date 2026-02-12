"use client";
import { useState, useEffect, useRef } from "react";
import { 
  HardDrive, File, FileText, Music, Video, Image as ImageIcon, 
  MoreVertical, Star, Clock, Cloud, Menu, X, Plus, Search,
  ChevronRight, Settings, Download, Trash2, Shield, Filter, SortAsc
} from "lucide-react";

export default function Vault() {
  // --- STATE MANAGEMENT ---
  const [files, setFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date | name | size
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, fileId: null });
  const [storageStats, setStorageStats] = useState({ used: 64.2, total: 128 }); 

  // --- INITIALIZATION ---
  useEffect(() => {
    const defaults = [
      { id: 1, name: "Mission_Report_Final.pdf", type: "document", size: 2500, date: "2026-02-12", starred: true },
      { id: 2, name: "Neural_Net_v9.json", type: "code", size: 14, date: "2026-02-11", starred: false },
      { id: 3, name: "Tokyo_Night_Walk.jpg", type: "image", size: 4200, date: "2026-02-10", starred: false },
      { id: 4, name: "lofi_coding_mix.mp3", type: "audio", size: 8500, date: "2026-02-09", starred: true },
      { id: 5, name: "Server_Backups.zip", type: "document", size: 156000, date: "2026-02-08", starred: false },
      { id: 6, name: "UI_Kit_v2.fig", type: "image", size: 12500, date: "2026-02-07", starred: true },
      { id: 7, name: "Launch_Sequence.mp4", type: "video", size: 450000, date: "2026-02-06", starred: false },
      { id: 8, name: "secret_keys.env", type: "code", size: 2, date: "2026-02-05", starred: true },
    ];
    setFiles(defaults);
  }, []);

  // --- CLICK OUTSIDE TO CLOSE MENUS ---
  useEffect(() => {
    const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  // --- FILTERING ENGINE ---
  const filteredFiles = files
    .filter(file => {
      // 1. Category Filter
      if (activeCategory === "Recent") return true; // Show all sorted by date
      if (activeCategory === "Starred") return file.starred;
      if (activeCategory === "Trash") return false; // Mock trash
      if (activeCategory === "Documents") return file.type === "document";
      if (activeCategory === "Media") return ["image", "video", "audio"].includes(file.type);
      return true;
    })
    .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase())) // 2. Search Filter
    .sort((a, b) => { // 3. Sorting
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "size") return b.size - a.size;
        return new Date(b.date) - new Date(a.date); // Default: Date
    });

  // --- HANDLERS ---
  const handleRightClick = (e, fileId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, fileId });
  };

  const formatSize = (kb) => {
      if (kb > 1000) return `${(kb/1000).toFixed(1)} MB`;
      return `${kb} KB`;
  };

  // --- NAVIGATION CONFIG ---
  const navItems = [
    { id: "All", icon: <HardDrive size={18}/>, label: "My Vault" },
    { id: "Recent", icon: <Clock size={18}/>, label: "Recent" },
    { id: "Starred", icon: <Star size={18}/>, label: "Starred" },
    { type: "divider" },
    { id: "Documents", icon: <FileText size={18}/>, label: "Documents" },
    { id: "Media", icon: <ImageIcon size={18}/>, label: "Media" },
    { type: "divider" },
    { id: "Trash", icon: <Trash2 size={18}/>, label: "Trash" },
  ];

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col md:flex-row text-gray-300 font-sans relative overflow-hidden">
      
      {/* 1. MOBILE TOP BAR */}
      <div className="md:hidden h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a] z-30">
        <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 active:bg-white/10 rounded-lg">
                <Menu size={24} className="text-white"/>
            </button>
            <span className="font-bold text-white text-lg">Vault</span>
        </div>
        <button className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Plus size={20}/>
        </button>
      </div>

      {/* 2. SIDEBAR (Adaptive) */}
      
      {/* Dimmer */}
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Panel */}
      <div className={`
        fixed md:relative z-50 top-0 left-0 h-full w-[280px] md:w-64 bg-[#0a0a0a] border-r border-white/5 
        transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Desktop Logo */}
        <div className="hidden md:flex h-20 items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-500/20 shadow-lg">
                <Cloud size={18} className="text-white"/>
            </div>
            <span>Vault</span>
          </div>
        </div>

        {/* Mobile Close Header */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-white/5 bg-[#0f0f0f]">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Navigation</span>
            <button onClick={() => setSidebarOpen(false)}><X size={20}/></button>
        </div>

        {/* Scrollable Nav */}
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <button className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm mb-6 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg">
                <Plus size={16} strokeWidth={3}/> New Upload
            </button>

            {navItems.map((item, i) => (
                item.type === "divider" ? (
                    <div key={i} className="h-px bg-white/5 my-2 mx-4"></div>
                ) : (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveCategory(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium group
                            ${activeCategory === item.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        <div className={activeCategory === item.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}>
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                        {activeCategory === item.id && <ChevronRight size={14} className="ml-auto opacity-50"/>}
                    </button>
                )
            ))}

            {/* Storage Widget */}
            <div className="mt-8 bg-[#111] border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Storage</span>
                    <span className="text-white font-bold">{storageStats.used} GB</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[50%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">50% of 128GB Used</p>
            </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">SP</div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">Soumoditya</div>
                    <div className="text-[10px] text-gray-500">Admin</div>
                </div>
                <Settings size={14} className="text-gray-500"/>
            </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
           
           {/* Desktop Toolbar */}
           <div className="hidden md:flex h-20 items-center justify-between px-8 border-b border-white/5 shrink-0">
               <div>
                   <h1 className="text-2xl font-bold text-white tracking-tight">{activeCategory}</h1>
                   <p className="text-xs text-gray-500 mt-1">{filteredFiles.length} files • Synced just now</p>
               </div>
               <div className="flex items-center gap-3">
                   {/* Search Bar */}
                   <div className="relative group">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors"/>
                       <input 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Search files..." 
                         className="bg-[#111] border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500/50 outline-none w-64 transition-all focus:w-80 placeholder:text-gray-600"
                       />
                   </div>
                   <div className="h-8 w-px bg-white/10 mx-2"></div>
                   <button onClick={() => setSortBy(sortBy === 'date' ? 'size' : 'date')} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white" title="Sort">
                       <SortAsc size={20}/>
                   </button>
                   <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><Filter size={20}/></button>
               </div>
           </div>

           {/* Content Grid */}
           <div className="flex-1 overflow-y-auto p-4 md:p-8">
               
               {/* Mobile Search (Only visible on phone) */}
               <div className="md:hidden mb-6">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..." 
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none"
                    />
                 </div>
               </div>

               {/* QUICK ACCESS (Recent) */}
               {activeCategory === "All" && !searchQuery && (
                   <div className="mb-8">
                       <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider px-1">Quick Access</h3>
                       <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                           {files.slice(0, 4).map(file => (
                               <div key={`quick-${file.id}`} className="min-w-[140px] md:min-w-[160px] bg-[#111] border border-white/5 p-4 rounded-xl hover:bg-[#161616] hover:border-blue-500/30 transition-all cursor-pointer group shadow-lg">
                                   <div className={`w-10 h-10 rounded-lg ${getFileColor(file.type)} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                       {getFileIcon(file.type)}
                                   </div>
                                   <div className="text-xs font-bold text-white truncate">{file.name}</div>
                                   <div className="text-[10px] text-gray-500 mt-1">{formatSize(file.size)}</div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {/* ALL FILES GRID */}
               <div className="mb-4 flex items-center justify-between px-1">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">All Files</h3>
                   <span className="text-[10px] text-gray-600">{filteredFiles.length} items</span>
               </div>

               {filteredFiles.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                       <Cloud size={48} className="mb-4 opacity-20"/>
                       <p>No files found</p>
                   </div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {filteredFiles.map(file => (
                        <div 
                            key={file.id} 
                            onContextMenu={(e) => handleRightClick(e, file.id)}
                            className="group bg-[#0a0a0a] border border-white/5 p-3 rounded-xl hover:bg-[#111] hover:border-white/10 transition-all cursor-pointer relative"
                        >
                            {/* Desktop Hover Actions */}
                            <div className="hidden md:flex absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <button className="p-1.5 bg-black/60 hover:bg-blue-600 rounded-md text-white backdrop-blur-md transition-colors"><Download size={12}/></button>
                                <button className="p-1.5 bg-black/60 hover:bg-white/20 rounded-md text-white backdrop-blur-md transition-colors"><MoreVertical size={12}/></button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${getFileColor(file.type)} flex items-center justify-center shrink-0`}>
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-400 transition-colors">{file.name}</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                                        <span>{formatSize(file.size)}</span>
                                        {file.starred && <Star size={8} className="text-yellow-500 fill-yellow-500"/>}
                                    </div>
                                </div>
                                {/* Mobile More Button */}
                                <button className="md:hidden text-gray-600 p-2"><MoreVertical size={16}/></button>
                            </div>
                        </div>
                      ))}
                   </div>
               )}

               {/* Scrolling Spacer */}
               <div className="h-24 md:h-0"></div>
           </div>
      </div>

      {/* --- 4. CUSTOM CONTEXT MENU (The "Hacker" Touch) --- */}
      {contextMenu.visible && (
        <div 
            className="fixed z-[100] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl py-1 w-40 animate-fade-in"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <button className="w-full text-left px-4 py-2 text-xs text-white hover:bg-blue-600 transition-colors flex items-center gap-2">
                <FileText size={12}/> Open
            </button>
            <button className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                <Star size={12}/> Star
            </button>
            <button className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                <Shield size={12}/> Encrypt
            </button>
            <div className="h-px bg-white/10 my-1"></div>
            <button className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                <Trash2 size={12}/> Delete
            </button>
        </div>
      )}

    </div>
  );
}

// --- HELPER FUNCTIONS ---
function getFileIcon(type) {
    if (type === 'image') return <ImageIcon size={18} />;
    if (type === 'video') return <Video size={18} />;
    if (type === 'audio') return <Music size={18} />;
    if (type === 'code') return <File size={18} />;
    return <FileText size={18} />;
}

function getFileColor(type) {
    if (type === 'image') return "bg-purple-500/10 text-purple-400";
    if (type === 'video') return "bg-red-500/10 text-red-400";
    if (type === 'audio') return "bg-yellow-500/10 text-yellow-400";
    if (type === 'code') return "bg-green-500/10 text-green-400";
    return "bg-blue-500/10 text-blue-400";
}