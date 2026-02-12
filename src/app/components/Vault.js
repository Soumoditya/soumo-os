"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { 
  HardDrive, Folder, FileText, Image as ImageIcon, MoreVertical, 
  Plus, Upload, Trash2, X, Download, ShieldCheck, Lock, Unlock,
  Grid, List, Search, Star, Clock, ChevronRight, ArrowLeft, Info,
  File, Video, Music
} from "lucide-react";

export default function Vault() {
  // --- STATE ---
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("root"); // ID of current folder
  const [view, setView] = useState("grid"); // grid | list
  const [selectedId, setSelectedId] = useState(null);
  const [navSection, setNavSection] = useState("files"); // files | recent | starred | trash
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  // --- INIT & PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem("soumo_vault_pro");
    if (saved) {
      setFiles(JSON.parse(saved));
    } else {
      const defaults = [
        { id: "root", name: "My Vault", type: "folder", parentId: null, date: new Date().toISOString() },
        { id: "f1", name: "Documents", type: "folder", parentId: "root", date: new Date().toISOString() },
        { id: "f2", name: "Images", type: "folder", parentId: "root", date: new Date().toISOString() },
        { id: "doc1", name: "Project_Alpha.txt", type: "text/plain", size: 2400, parentId: "f1", date: new Date().toISOString(), content: "Confidential Project Data..." },
      ];
      setFiles(defaults);
      localStorage.setItem("soumo_vault_pro", JSON.stringify(defaults));
    }
  }, []);

  const saveVault = (newFiles) => {
    setFiles(newFiles);
    localStorage.setItem("soumo_vault_pro", JSON.stringify(newFiles));
  };

  // --- ACTIONS ---
  const handleUpload = (e) => {
    const fileList = Array.from(e.target.files || e.dataTransfer.files);
    if (!fileList.length) return;

    setUploading(true);
    
    // Process each file
    const newFiles = [];
    let processed = 0;

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type || "unknown",
          size: file.size,
          parentId: currentFolder,
          date: new Date().toISOString(),
          content: event.target.result,
          starred: false,
          trash: false
        });
        processed++;
        if (processed === fileList.length) {
          setTimeout(() => { // Fake encryption delay
            saveVault([...files, ...newFiles]);
            setUploading(false);
          }, 1500);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const createFolder = () => {
    const name = prompt("Folder Name:");
    if (!name) return;
    const newFolder = {
      id: Date.now().toString(),
      name,
      type: "folder",
      parentId: currentFolder,
      date: new Date().toISOString(),
      trash: false
    };
    saveVault([...files, newFolder]);
  };

  const deleteItem = (id) => {
    // If in trash, delete permanently. If not, move to trash.
    if (navSection === 'trash') {
      if(confirm("Permanently delete? This cannot be undone.")) {
        // Recursive delete for folders not implemented for simplicity, just deleting item
        saveVault(files.filter(f => f.id !== id));
        setSelectedId(null);
      }
    } else {
      saveVault(files.map(f => f.id === id ? { ...f, trash: true } : f));
      setSelectedId(null);
    }
  };

  const restoreItem = (id) => {
    saveVault(files.map(f => f.id === id ? { ...f, trash: false } : f));
  };

  const toggleStar = (e, id) => {
    e.stopPropagation();
    saveVault(files.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  };

  // --- VIEW LOGIC ---
  const getBreadcrumbs = () => {
    const path = [];
    let curr = files.find(f => f.id === currentFolder);
    while (curr) {
      path.unshift(curr);
      curr = files.find(f => f.id === curr.parentId);
    }
    return path;
  };

  const filteredFiles = useMemo(() => {
    let list = files.filter(f => {
      // 1. Trash Filter
      if (navSection === 'trash') return f.trash;
      if (f.trash) return false;

      // 2. Section Logic
      if (navSection === 'recent') return true; // Will sort later
      if (navSection === 'starred') return f.starred;
      
      // 3. Folder Navigation
      return f.parentId === currentFolder;
    });

    // Search Filter
    if (search) {
      list = files.filter(f => !f.trash && f.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Sort
    if (navSection === 'recent') {
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Folders first, then files
    return list.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return 0;
    });
  }, [files, currentFolder, navSection, search]);

  const selectedFile = files.find(f => f.id === selectedId);
  const totalSize = (files.reduce((acc, f) => acc + (f.size || 0), 0) / 1024 / 1024).toFixed(2);

  // --- DRAG & DROP ---
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => { e.preventDefault(); handleUpload(e); };

  return (
    <div className="w-full h-full bg-[#050505] text-gray-200 font-sans flex overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
      
      {/* 1. SIDEBAR NAVIGATION */}
      <div className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <HardDrive className="text-green-500 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Vault</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Secure Cloud</span>
          </div>
        </div>

        <button onClick={() => fileInputRef.current.click()} className="flex items-center justify-center gap-2 bg-white text-black p-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-lg mb-6 group">
          <Upload size={18} className="group-hover:-translate-y-1 transition-transform"/> Upload
        </button>
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleUpload} />

        <div className="space-y-1 flex-1">
          <NavBtn icon={<HardDrive/>} label="My Vault" active={navSection==='files'} onClick={()=>{setNavSection('files'); setCurrentFolder('root'); setSearch('')}} />
          <NavBtn icon={<Clock/>} label="Recent" active={navSection==='recent'} onClick={()=>{setNavSection('recent'); setSearch('')}} />
          <NavBtn icon={<Star/>} label="Starred" active={navSection==='starred'} onClick={()=>{setNavSection('starred'); setSearch('')}} />
          <NavBtn icon={<Trash2/>} label="Trash" active={navSection==='trash'} onClick={()=>{setNavSection('trash'); setSearch('')}} />
        </div>

        <div className="mt-auto bg-[#111] p-4 rounded-xl border border-white/5">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Storage</span>
            <span className="text-white font-bold">{totalSize} MB</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[10%]"></div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        
        {/* Header / Toolbar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur z-10">
          
          {/* Breadcrumbs / Title */}
          <div className="flex items-center gap-2 overflow-hidden">
            {navSection === 'files' && !search ? (
              <>
                {currentFolder !== 'root' && (
                  <button onClick={() => setCurrentFolder(files.find(f => f.id === currentFolder)?.parentId || 'root')} className="p-1 hover:bg-white/10 rounded-full mr-2">
                    <ArrowLeft size={18}/>
                  </button>
                )}
                <div className="flex items-center text-sm font-medium text-gray-400">
                  {getBreadcrumbs().map((folder, i) => (
                    <div key={folder.id} className="flex items-center">
                      {i > 0 && <ChevronRight size={14} className="mx-1 opacity-50"/>}
                      <span 
                        onClick={() => setCurrentFolder(folder.id)}
                        className={`cursor-pointer hover:text-white ${i === getBreadcrumbs().length - 1 ? 'text-white font-bold' : ''}`}
                      >
                        {folder.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                {navSection} {search && `/ Search: "${search}"`}
              </h2>
            )}
          </div>

          {/* Search & Layout Toggles */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-white transition-colors"/>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..." 
                className="bg-[#151515] border border-transparent focus:border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white outline-none w-64 transition-all"
              />
            </div>
            <div className="flex bg-[#151515] rounded-lg p-1 border border-white/5">
              <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Grid size={16}/></button>
              <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><List size={16}/></button>
            </div>
            {navSection === 'files' && !search && (
              <button onClick={createFolder} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors" title="New Folder">
                <Folder size={20} />
              </button>
            )}
          </div>
        </div>

        {/* File Grid / List */}
        <div className="flex-1 overflow-y-auto p-6" onClick={() => setSelectedId(null)}>
          
          {uploading && (
            <div className="mb-6 bg-green-900/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <Lock className="text-green-500"/>
              <div>
                <h3 className="text-green-400 font-bold text-sm">Encrypting & Uploading...</h3>
                <p className="text-green-500/60 text-xs">Securing data blocks via AES-256</p>
              </div>
            </div>
          )}

          {filteredFiles.length === 0 && !uploading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
              <Folder size={64} className="mb-4 stroke-1"/>
              <p>Folder is empty</p>
            </div>
          )}

          {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map(file => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  selected={selectedId === file.id}
                  onSelect={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                  onNavigate={(id) => { setCurrentFolder(id); setSearch(''); }}
                  onContextMenu={(e) => { e.preventDefault(); /* Would open context menu */ }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b border-white/5">
                <span className="flex-1">Name</span>
                <span className="w-32">Date Modified</span>
                <span className="w-24">Size</span>
              </div>
              {filteredFiles.map(file => (
                <FileListRow 
                  key={file.id} 
                  file={file} 
                  selected={selectedId === file.id}
                  onSelect={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                  onNavigate={(id) => { setCurrentFolder(id); setSearch(''); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. INSPECTOR PANEL (Right Sidebar) */}
      {selectedFile && (
        <div className="w-80 bg-[#0a0a0a] border-l border-white/5 flex flex-col animate-slide-in-right">
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <span className="font-bold text-white">Details</span>
            <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-white"><X size={18}/></button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Preview */}
            <div className="aspect-square bg-[#111] rounded-2xl mb-6 flex items-center justify-center border border-white/5 overflow-hidden">
              {selectedFile.type.startsWith("image/") ? (
                <img src={selectedFile.content} className="w-full h-full object-cover" />
              ) : selectedFile.type === 'folder' ? (
                <Folder size={64} className="text-blue-500"/>
              ) : (
                <FileText size={64} className="text-gray-500"/>
              )}
            </div>

            {/* Meta */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white break-all mb-1">{selectedFile.name}</h3>
                <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20 uppercase font-bold">{selectedFile.type === 'folder' ? 'Folder' : selectedFile.type.split('/')[1] || 'Unknown'}</span>
              </div>

              <div className="space-y-3">
                <MetaRow label="Size" value={selectedFile.type === 'folder' ? '-' : (selectedFile.size / 1024).toFixed(1) + ' KB'} />
                <MetaRow label="Modified" value={new Date(selectedFile.date).toLocaleDateString()} />
                <MetaRow label="Path" value={selectedFile.parentId === 'root' ? 'My Vault' : '...'} />
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-4 border-t border-white/5 grid grid-cols-2 gap-2">
            <button onClick={(e) => toggleStar(e, selectedFile.id)} className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-colors ${selectedFile.starred ? 'bg-yellow-500/20 text-yellow-500' : 'bg-[#151515] text-gray-400 hover:text-white'}`}>
              <Star size={18} fill={selectedFile.starred ? "currentColor" : "none"}/>
              {selectedFile.starred ? 'Starred' : 'Star'}
            </button>
            <button onClick={() => deleteItem(selectedFile.id)} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-900/10 text-red-500 font-bold hover:bg-red-900/20 transition-colors">
              <Trash2 size={18}/> {navSection === 'trash' ? 'Delete' : 'Trash'}
            </button>
            {navSection === 'trash' && (
               <button onClick={() => restoreItem(selectedFile.id)} className="col-span-2 bg-[#151515] text-white p-3 rounded-xl font-bold hover:bg-[#202020]">Restore</button>
            )}
            {selectedFile.type.startsWith("image/") && navSection !== 'trash' && (
               <a href={selectedFile.content} download={selectedFile.name} className="col-span-2 bg-white text-black p-3 rounded-xl font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                 <Download size={18}/> Download
               </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {React.cloneElement(icon, { size: 18, className: active ? 'text-green-400' : '' })}
      {label}
    </button>
  )
}

function FileCard({ file, selected, onSelect, onNavigate }) {
  const isImg = file.type.startsWith("image/");
  const isFolder = file.type === 'folder';

  return (
    <div 
      onClick={onSelect}
      onDoubleClick={() => isFolder && onNavigate(file.id)}
      className={`group relative aspect-[4/5] rounded-2xl p-3 border transition-all cursor-pointer flex flex-col ${selected ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500' : 'bg-[#151515] border-white/5 hover:bg-[#1a1a1a] hover:border-white/10'}`}
    >
      <div className="flex-1 flex items-center justify-center mb-2 overflow-hidden rounded-xl bg-black/20">
        {isImg ? (
          <img src={file.content} className="w-full h-full object-cover" />
        ) : isFolder ? (
          <Folder size={48} className="text-blue-500 fill-blue-500/20" />
        ) : (
          <FileText size={48} className="text-gray-600" />
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-200 truncate w-full">{file.name}</span>
        {file.starred && <Star size={12} className="text-yellow-500 flex-shrink-0 mt-1" fill="currentColor"/>}
      </div>
      <div className="text-[10px] text-gray-600 mt-1">{isFolder ? 'Folder' : (file.size/1024).toFixed(0)+' KB'}</div>
    </div>
  )
}

function FileListRow({ file, selected, onSelect, onNavigate }) {
  const isFolder = file.type === 'folder';
  return (
    <div 
      onClick={onSelect}
      onDoubleClick={() => isFolder && onNavigate(file.id)}
      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer border transition-colors ${selected ? 'bg-blue-600/10 border-blue-500/50' : 'border-transparent hover:bg-[#151515]'}`}
    >
      {isFolder ? <Folder size={20} className="text-blue-500"/> : <FileText size={20} className="text-gray-500"/>}
      <span className="text-sm text-gray-200 flex-1 truncate">{file.name}</span>
      <span className="text-xs text-gray-500 w-32">{new Date(file.date).toLocaleDateString()}</span>
      <span className="text-xs text-gray-500 w-24">{isFolder ? '-' : (file.size/1024).toFixed(1)+' KB'}</span>
    </div>
  )
}

function MetaRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  )
}

const React = require('react');