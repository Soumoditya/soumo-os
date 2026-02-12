"use client";
import { useState, useEffect } from "react";
import { 
  Cpu, Shield, Users, HardDrive, LogOut, Lock, 
  Wallpaper, Ban, ArrowLeft, Activity, Terminal
} from "lucide-react";

// --- CONFIGURATION ---
const GOD_USER = "admin"; 

export default function Sys() {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  
  // 1. Load DB & Check for Active Session on Boot
  useEffect(() => {
    // Load Data
    const savedData = localStorage.getItem("spail_db_v6");
    if (savedData) setDb(JSON.parse(savedData));

    // Check Session (SSO)
    const activeSession = localStorage.getItem("soumo_auth_session");
    if (activeSession && savedData) {
      const parsedDb = JSON.parse(savedData);
      const foundUser = parsedDb.users.find(u => u.username === activeSession);
      if (foundUser) setUser(foundUser);
    }
  }, []);

  const handleLogin = (username, password) => {
    if (!db) return;
    const foundUser = db.users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      // SAVE SESSION (This logs you into Spail too!)
      localStorage.setItem("soumo_auth_session", username);
    } else {
      alert("Access Denied: Invalid System ID");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("soumo_auth_session"); // Logs out of everything
  };

  // --- ADMIN ACTIONS ---
  const deleteUser = (targetUsername) => {
    if (targetUsername === GOD_USER) return alert("Cannot delete God User.");
    if (!confirm(`PERMANENTLY DELETE user '${targetUsername}'?`)) return;

    const newUsers = db.users.filter(u => u.username !== targetUsername);
    const newEmails = db.emails.filter(e => !e.from.includes(targetUsername) && !e.to.includes(targetUsername));
    
    const newDb = { ...db, users: newUsers, emails: newEmails };
    setDb(newDb);
    localStorage.setItem("spail_db_v6", JSON.stringify(newDb));
  };

  const nukeSystem = () => {
    if (prompt("Type 'NUKE' to factory reset the OS.") === "NUKE") {
      localStorage.removeItem("spail_db_v6");
      localStorage.removeItem("soumo_auth_session");
      window.location.reload();
    }
  };

  // "Back" just reloads the page to return to default state (Desktop)
  const exitSystem = () => {
    window.location.href = "/";
  };

  if (!db) return <div className="text-white text-center p-10 font-mono">Initializing Core...</div>;

  if (!user) return <SysLogin onLogin={handleLogin} onBack={exitSystem} />;

  return (
    <div className="w-full h-full bg-[#050505] text-gray-200 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={exitSystem}>
          <div className="bg-purple-900/20 p-2 rounded-lg"><Cpu className="text-purple-500" /></div>
          <span className="text-xl font-bold text-white tracking-widest">SYSTEM</span>
        </div>
        
        <div className="mb-8">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Active Session</div>
          <div className="flex items-center gap-3 bg-[#151515] p-3 rounded-xl border border-white/5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${user.username === GOD_USER ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gray-700'}`}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-bold truncate">{user.username}</div>
              <div className="text-[10px] text-gray-500 truncate">{user.username === GOD_USER ? 'ROOT ACCESS' : 'Standard User'}</div>
            </div>
          </div>
        </div>

        <button onClick={exitSystem} className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors mb-2">
          <ArrowLeft size={18}/> Back to OS
        </button>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-red-400 hover:bg-red-900/10 p-3 rounded-xl transition-colors">
          <LogOut size={18}/> Terminate Session
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {user.username === GOD_USER ? (
          <GodModeDashboard db={db} onDeleteUser={deleteUser} onNuke={nukeSystem} />
        ) : (
          <UserModeDashboard user={user} />
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SysLogin({ onLogin, onBack }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden font-mono">
      <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"><ArrowLeft/> Back</button>
      <div className="w-96 bg-[#0a0a0a] p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Shield className="text-purple-500 w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">System Core</h2>
        <p className="text-gray-500 text-center text-xs mb-8">Restricted Access Environment</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(u, p); }} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase ml-1">Identity</label>
            <input className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition-colors" value={u} onChange={e=>setU(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase ml-1">Key</label>
            <input type="password" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition-colors" value={p} onChange={e=>setP(e.target.value)} />
          </div>
          <button className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors mt-4">Authenticate</button>
        </form>
      </div>
    </div>
  )
}

function GodModeDashboard({ db, onDeleteUser, onNuke }) {
  const userCount = db.users.length;
  const storageUsed = (JSON.stringify(db).length / 1024).toFixed(2); 

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Terminal className="text-red-500" /> GOD MODE ACTIVE
        </h1>
        <span className="text-xs font-mono text-green-500 border border-green-900/30 bg-green-900/10 px-3 py-1 rounded-full">SYSTEM STABLE</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-blue-400"/>} label="Identities" value={userCount} />
        <StatCard icon={<HardDrive className="text-green-400"/>} label="DB Size" value={`${storageUsed} KB`} />
        <StatCard icon={<Activity className="text-purple-400"/>} label="Uptime" value="99.9%" />
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white">Identity Registry</h3>
        </div>
        <div className="divide-y divide-white/5">
          {db.users.map(u => (
            <div key={u.username} className="p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.username === GOD_USER ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-gray-800'}`}>
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium">{u.name || u.username}</div>
                  <div className="text-xs text-gray-500">@{u.username}</div>
                </div>
              </div>
              {u.username !== GOD_USER ? (
                <button onClick={() => onDeleteUser(u.username)} className="text-red-500 hover:bg-red-900/20 p-2 rounded-lg transition-colors group" title="Ban User">
                  <Ban size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              ) : <span className="text-xs font-bold text-red-500 bg-red-900/10 px-3 py-1 rounded border border-red-900/30">ROOT</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-red-900/30 bg-red-950/10 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h3 className="text-red-500 font-bold">Factory Reset</h3>
          <p className="text-xs text-red-400/50">Irreversible data destruction.</p>
        </div>
        <button onClick={onNuke} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.4)]">NUKE</button>
      </div>
    </div>
  )
}

function UserModeDashboard({ user }) {
  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pt-10">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-500">Manage your local environment.</p>
      <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-xl"><Wallpaper className="text-blue-400"/></div>
          <div><h3 className="font-bold text-white">Wallpaper</h3><p className="text-xs text-gray-500">Personalize desktop</p></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
           {[1,2,3,4].map(i => (<div key={i} className="aspect-video bg-[#151515] rounded-lg hover:ring-2 ring-blue-500 cursor-pointer transition-all border border-white/5"></div>))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
      <div><div className="text-2xl font-bold text-white">{value}</div><div className="text-xs text-gray-500 uppercase tracking-widest">{label}</div></div>
    </div>
  )
}