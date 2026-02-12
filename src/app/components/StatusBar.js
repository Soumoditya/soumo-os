"use client";
import { useState, useEffect } from "react";
import { 
  Wifi, Battery, BatteryCharging, ShieldAlert,
  Bell, BellOff, Search, User, Command
} from "lucide-react";

export default function StatusBar({ onOpenApp }) {
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });
  const [isAdmin, setIsAdmin] = useState(false);
  const [dnd, setDnd] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkPrivileges = () => {
      const session = localStorage.getItem("soumo_auth_session");
      setIsAdmin(session === "admin");
    };
    checkPrivileges();
    const interval = setInterval(checkPrivileges, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then(batt => {
        const updateBatt = () => {
          setBattery({ level: Math.round(batt.level * 100), charging: batt.charging });
        };
        updateBatt();
        batt.addEventListener('levelchange', updateBatt);
        batt.addEventListener('chargingchange', updateBatt);
      });
    }
  }, []);

  return (
    // FIX: bg-transparent (No gradient, no blur, no color). 
    // Added 'drop-shadow-md' so text pops against any background.
    <div className="fixed top-0 left-0 w-full h-12 flex items-center justify-between px-6 z-[5000] select-none text-sm font-medium text-gray-200 bg-transparent pointer-events-none drop-shadow-md">
      
      {/* LEFT: System Identity */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div 
          onClick={() => onOpenApp && onOpenApp('search')}
          className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group"
        >
          {/* Simple Blue Dot Identity */}
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
          <span className="font-bold tracking-tight text-xs font-sans opacity-90 group-hover:opacity-100">Soumo OS</span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase shadow-lg">
            <ShieldAlert size={10} />
            <span>ROOT</span>
          </div>
        )}
      </div>

      {/* CENTER: Date & Time */}
      <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-gray-300 hidden md:block">
        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        <span className="mx-3 opacity-30">|</span>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* RIGHT: Status & Controls */}
      <div className="flex items-center gap-6 pointer-events-auto">
        
        {/* Hardware Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span>{battery.level}%</span>
            {battery.charging ? <BatteryCharging size={16} className="text-green-400"/> : <Battery size={16}/>}
          </div>
          <Wifi size={16} className="text-white"/>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          <button 
            onClick={() => {
              console.log("Search Clicked"); // Debug check
              if (onOpenApp) onOpenApp('search');
            }} 
            className="p-2 rounded-full hover:bg-white/10 text-gray-200 hover:text-white transition-all active:scale-90"
            title="Search"
          >
            <Search size={16} />
          </button>

          <button 
            onClick={() => setDnd(!dnd)} 
            className={`p-2 rounded-full transition-all active:scale-90 ${dnd ? 'text-white' : 'hover:bg-white/10 text-gray-200 hover:text-white'}`}
            title="Do Not Disturb"
          >
            {dnd ? <BellOff size={16} /> : <Bell size={16} />}
          </button>

          <button 
            onClick={() => onOpenApp && onOpenApp('system')}
            className="ml-2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 border border-white/10"
          >
             {isAdmin ? (
               <div className="font-bold text-red-500 text-[10px]">R</div>
             ) : (
               <User size={12} className="text-gray-200" />
             )}
          </button>

        </div>

      </div>
    </div>
  );
}