"use client";
import { useState, useEffect } from "react";
import { Code, Play, Save, Trash2, ShieldAlert, CheckCircle } from "lucide-react";

export default function CodeStudio() {
  const [code, setCode] = useState("// Write JavaScript here\n// Example: document.body.style.filter = 'hue-rotate(90deg)';\n\n");
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    // Check if user is Admin
    const session = localStorage.getItem("soumo_auth_session");
    setIsAdmin(session === "admin");

    // Load saved local script
    const saved = localStorage.getItem("soumo_local_script");
    if (saved) setCode(saved);
  }, []);

  // 1. Run Locally (Safe Test)
  const runCode = () => {
    try {
      // DANGEROUS: eval() executes string as code. Perfect for a Hacker OS.
      eval(code); 
      setStatus("Executed Successfully");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // 2. Deploy Globally (GOD MODE - Admin Only)
  const deployGlobal = () => {
    if (!isAdmin) return alert("Access Denied: Root Privileges Required.");
    if (!confirm("WARNING: This will affect ALL users on this browser. Proceed?")) return;
    
    localStorage.setItem("soumo_global_patch", code);
    setStatus("System Patched Globally");
  };

  // 3. Clear Global Patch
  const clearGlobal = () => {
    localStorage.removeItem("soumo_global_patch");
    window.location.reload();
  };

  return (
    <div className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono flex flex-col">
      
      {/* Toolbar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#252526]">
        <div className="flex items-center gap-3">
          <Code className="text-blue-400" size={20} />
          <span className="font-bold text-white text-sm">Code Studio</span>
          {isAdmin && <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-500/30">ROOT ACCESS</span>}
        </div>

        <div className="flex gap-2">
          {/* Run Button (Everyone) */}
          <button onClick={runCode} className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs transition-colors">
            <Play size={14}/> Run Local
          </button>

          {/* Admin Controls */}
          {isAdmin && (
            <>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button onClick={deployGlobal} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs transition-colors animate-pulse">
                <ShieldAlert size={14}/> Deploy System-Wide
              </button>
              <button onClick={clearGlobal} className="p-1.5 hover:bg-white/10 rounded text-gray-400" title="Clear Global Patch">
                <Trash2 size={16}/>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <textarea 
          className="w-full h-full bg-[#1e1e1e] p-4 text-sm outline-none resize-none text-green-100 selection:bg-blue-500/30"
          value={code}
          onChange={(e) => { setCode(e.target.value); localStorage.setItem("soumo_local_script", e.target.value); }}
          spellCheck="false"
        />
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-[#007acc] text-white flex items-center px-4 text-xs justify-between">
        <span>JavaScript V8 Engine</span>
        <span className="flex items-center gap-2">
          {status.includes("Error") ? <ShieldAlert size={12}/> : <CheckCircle size={12}/>}
          {status}
        </span>
      </div>
    </div>
  );
}