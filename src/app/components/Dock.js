"use client";
import { useState, useEffect } from "react";
import { 
  Search, Map, Mail, HardDrive, Cpu, Terminal as TerminalIcon, Code
} from "lucide-react";

export default function Dock({ activeTab, setActiveTab }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkPrivileges = () => {
      const session = localStorage.getItem("soumo_auth_session");
      setIsAdmin(session === "admin");
    };
    checkPrivileges();
    // Check less frequently to save performance, 1s is fine
    const interval = setInterval(checkPrivileges, 1000);
    return () => clearInterval(interval);
  }, []);

  const apps = [
    { id: 'search', icon: <Search size={24} />, label: 'Search' },
    { id: 'maps', icon: <Map size={24} />, label: 'Maps' },
    { id: 'mail', icon: <Mail size={24} />, label: 'Mail' },
    { id: 'drive', icon: <HardDrive size={24} />, label: 'Vault' },
    { id: 'code', icon: <Code size={24} />, label: 'Code Studio' },
    { id: 'terminal', icon: <TerminalIcon size={24} />, label: 'Terminal' },
    { id: 'system', icon: <Cpu size={24} />, label: 'System' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl transition-all hover:scale-105">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => setActiveTab(app.id)}
            className={`
              relative group p-3 rounded-xl transition-all duration-300
              ${activeTab === app.id ? 'bg-white text-black scale-110 shadow-lg' : 'text-white hover:bg-white/20 hover:scale-110'}
            `}
          >
            {app.icon}
            
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              {app.label}
            </span>

            {/* Active Dot */}
            {activeTab === app.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}