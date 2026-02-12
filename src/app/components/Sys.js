"use client";
import { Cpu, Wifi, Battery, HardDrive, Activity } from "lucide-react";

export default function Sys({ onExit }) {
  const systems = [
    { id: 1, label: "CPU Load", value: "12%", sub: "4 Cores Active", icon: <Cpu size={20}/>, color: "text-blue-400" },
    { id: 2, label: "Memory", value: "2.4 GB", sub: "8.0 GB Total", icon: <HardDrive size={20}/>, color: "text-purple-400" },
    { id: 3, label: "Network", value: "5G", sub: "Secure Link", icon: <Wifi size={20}/>, color: "text-green-400" },
    { id: 4, label: "Battery", value: "98%", sub: "Charging", icon: <Battery size={20}/>, color: "text-yellow-400" },
  ];

  return (
    <div className="w-full h-full bg-black text-white flex flex-col p-6 md:p-12 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">System</h1>
          <p className="text-gray-500 text-sm">v5.0.0 • Stable</p>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
      </div>

      {/* MOBILE SLIDER: Horizontal Scroll for Stats */}
      <div className="md:hidden mb-8 -mx-6 px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {systems.map((sys) => (
            <div key={sys.id} className="min-w-[160px] bg-[#111] border border-white/10 p-5 rounded-2xl flex flex-col gap-3">
              <div className={`${sys.color} bg-white/5 w-10 h-10 rounded-full flex items-center justify-center`}>
                {sys.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{sys.value}</div>
                <div className="text-xs text-gray-400">{sys.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP GRID (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-12">
        {systems.map((sys) => (
            <div key={sys.id} className="bg-[#111] border border-white/10 p-6 rounded-2xl">
              <div className={`${sys.color} mb-4`}>{sys.icon}</div>
              <div className="text-3xl font-bold mb-1">{sys.value}</div>
              <div className="text-sm text-gray-500">{sys.label}</div>
            </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-3">
        <button className="w-full bg-[#111] hover:bg-[#222] text-white border border-white/10 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
           <Activity size={18}/> Run Diagnostics
        </button>
        <button onClick={onExit} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-xl font-medium transition-all">
           Close System
        </button>
      </div>

      {/* Spacer for Dock */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
}