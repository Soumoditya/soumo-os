"use client";
import { useState, useEffect } from "react";
import { Cpu, Wifi, Battery, HardDrive, Activity, Terminal, Shield, Globe } from "lucide-react";

export default function Sys({ onExit }) {
  const [scanning, setScanning] = useState(false);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (s) => {
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m ${s % 60}s`;
  };

  const handleScan = () => {
      setScanning(true);
      setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className="w-full h-full bg-black text-white p-6 md:p-12 overflow-y-auto font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter flex items-center gap-3">
              <Activity className="text-green-500 animate-pulse"/> SYSTEM STATUS
          </h1>
          <p className="text-gray-500 text-xs mt-1">KERNEL V5.0.0 • SECURE</p>
        </div>
        <div className="text-right">
             <div className="text-xs text-gray-500">UPTIME</div>
             <div className="font-bold text-blue-400">{formatUptime(uptime)}</div>
        </div>
      </div>

      {/* GRAPH AREA */}
      <div className="w-full h-48 bg-[#0a0a0a] border border-white/10 rounded-xl mb-8 relative overflow-hidden flex items-end">
          <div className="absolute top-4 left-4 text-xs text-gray-500">CPU LOAD HISTORY</div>
          {/* Simulated Bars */}
          <div className="w-full flex items-end gap-1 px-1 h-full opacity-50">
              {[...Array(40)].map((_, i) => (
                  <div key={i} 
                       className="flex-1 bg-blue-600 transition-all duration-500" 
                       style={{height: `${Math.random() * 80 + 10}%`, opacity: i > 30 ? 1 : 0.5}}>
                  </div>
              ))}
          </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Cpu/>} label="CPU Load" value="14%" sub="8 Cores Active" color="text-blue-400"/>
        <StatCard icon={<HardDrive/>} label="Memory" value="4.2 GB" sub="16 GB Total" color="text-purple-400"/>
        <StatCard icon={<Wifi/>} label="Network" value="1.2 Gbps" sub="Encrypted Tunnel" color="text-green-400"/>
        <StatCard icon={<Shield/>} label="Security" value="Active" sub="Firewall On" color="text-yellow-400"/>
      </div>

      {/* DIAGNOSTICS CONSOLE */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-400 h-40 overflow-hidden relative">
          <div className="absolute top-2 right-2 px-2 py-1 bg-white/5 rounded text-[10px]">CONSOLE</div>
          {scanning ? (
              <div className="space-y-1 text-green-400">
                  <div>> INIT DIAGNOSTIC SEQUENCE...</div>
                  <div>> CHECKING INTEGRITY... OK</div>
                  <div>> MEMORY TEST... PASS</div>
                  <div>> PINGING GATEWAY... 1ms</div>
                  <div className="animate-pulse">> ANALYZING HEURISTICS...</div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                  <p>System idle. Ready for command.</p>
                  <button onClick={handleScan} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded uppercase tracking-wider text-xs transition-all">
                      Run Full Scan
                  </button>
              </div>
          )}
      </div>

      <div className="h-24"></div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className="bg-[#111] border border-white/10 p-4 rounded-xl hover:border-white/20 transition-colors group">
            <div className={`${color} mb-2 group-hover:scale-110 transition-transform`}>{icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs font-bold text-gray-400">{label}</div>
            <div className="text-[10px] text-gray-600 mt-1">{sub}</div>
        </div>
    );
}