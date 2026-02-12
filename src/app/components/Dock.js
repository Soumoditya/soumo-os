"use client";
import { 
  Search, Map, Mail, HardDrive, Cpu, Terminal as TerminalIcon, Code, FileText
} from "lucide-react";

export default function Dock({ activeTab, setActiveTab }) {
  const apps = [
    { id: 'search', icon: <Search size={22} />, label: 'Search' },
    { id: 'maps', icon: <Map size={22} />, label: 'Maps' },
    { id: 'mail', icon: <Mail size={22} />, label: 'Mail' },
    { id: 'notes', icon: <FileText size={22} />, label: 'Notes' },
    { id: 'drive', icon: <HardDrive size={22} />, label: 'Vault' },
    { id: 'code', icon: <Code size={22} />, label: 'Studio' },
    { id: 'terminal', icon: <TerminalIcon size={22} />, label: 'Term' },
    { id: 'system', icon: <Cpu size={22} />, label: 'Sys' },
  ];

  return (
    <>
      {/* MOBILE: Scrollable Bottom Bar (Like Android/iOS App Switcher) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#050505] border-t border-white/10 z-[9999]">
        {/* 'overflow-x-auto' enables horizontal scrolling. 'no-scrollbar' hides the ugly bar. */}
        <div className="flex items-center justify-start px-4 gap-4 h-full overflow-x-auto no-scrollbar w-full">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => setActiveTab(app.id)}
              className={`flex flex-col items-center justify-center min-w-[50px] transition-colors ${activeTab === app.id ? 'text-blue-400' : 'text-gray-500'}`}
            >
              <div className={`${activeTab === app.id ? 'bg-blue-500/10' : ''} p-2 rounded-xl`}>
                {app.icon}
              </div>
              <span className="text-[10px] font-medium mt-1">{app.label}</span>
            </button>
          ))}
          {/* Spacer to ensure the last item isn't flush against the edge */}
          <div className="min-w-[20px]"></div>
        </div>
      </div>

      {/* DESKTOP: Floating Mac Dock (Unchanged) */}
      <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
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
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                {app.label}
              </span>
              {activeTab === app.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}