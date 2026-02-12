"use client";
import { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, X, ChevronRight } from "lucide-react";

export default function Terminal({ onClose, onOpenApp }) {
  const [history, setHistory] = useState([
    "Soumo OS Kernel [v4.0.0]",
    "Secure Connection Established.",
    "Type 'help' to initialize.",
    ""
  ]);
  const [input, setInput] = useState("");
  const [isMatrix, setIsMatrix] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === "Enter") {
      const cmd = input.trim().toLowerCase();
      const newHistory = [...history, `root@soumo:~$ ${input}`];

      switch (cmd) {
        case "help":
          newHistory.push(
            "--------------------------------",
            "  open [app]   ::  Launch System Apps",
            "  whoami       ::  Identity Check",
            "  date         ::  System Time",
            "  clear        ::  Wipe Screen",
            "  matrix       ::  Toggle Visuals",
            "  reboot       ::  Restart OS",
            "  exit         ::  Terminate Session",
            "--------------------------------"
          );
          break;
        case "clear": setHistory([]); setInput(""); return;
        case "whoami": newHistory.push("User: ROOT (God Mode)", "Permissions: R/W/X"); break;
        case "date": newHistory.push(new Date().toString()); break;
        case "matrix": setIsMatrix(!isMatrix); newHistory.push(isMatrix ? "Matrix: Disabled" : "Matrix: Enabled"); break;
        case "reboot": window.location.reload(); break;
        case "exit": onClose(); break;
        
        // App Launchers
        case "open mail": onOpenApp('mail'); newHistory.push(">> Spail.exe"); break;
        case "open maps": onOpenApp('maps'); newHistory.push(">> SatLink.exe"); break;
        case "open drive": onOpenApp('drive'); newHistory.push(">> Vault.exe"); break;
        case "open sys": onOpenApp('system'); newHistory.push(">> Core.exe"); break;
        case "open search": onOpenApp('search'); newHistory.push(">> Web.exe"); break;
        
        case "": break;
        default: newHistory.push(`Error: Command '${cmd}' not recognized.`);
      }

      setHistory(newHistory);
      setInput("");
    }
  };

  return (
    <div className={`w-full h-full bg-[#050505]/95 backdrop-blur-md font-mono text-sm p-6 flex flex-col relative overflow-hidden ${isMatrix ? 'matrix-bg' : ''}`}>
      
      {isMatrix && <MatrixRain />}

      {/* MAC-STYLE HEADER */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-2 z-10">
        <div className="flex items-center gap-4">
           {/* Window Controls */}
           <div className="flex gap-2">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></button>
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div>
           </div>
           {/* Title */}
           <div className="flex items-center gap-2 text-gray-500 select-none">
             <TerminalIcon size={12} />
             <span className="font-semibold text-xs">root — zsh — 80x24</span>
           </div>
        </div>
      </div>

      {/* OUTPUT AREA */}
      <div className="flex-1 overflow-y-auto space-y-1.5 z-10 text-gray-300 font-medium leading-relaxed scrollbar-hide">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT AREA (Fixed Padding to avoid 'N' button) */}
      <div className="flex items-center gap-3 mt-4 z-10 pb-16">
        <span className="text-green-500 font-bold flex items-center gap-1">➜ <span className="text-blue-400">~</span></span>
        <input 
          className="bg-transparent outline-none text-white flex-1 text-base placeholder:text-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          autoFocus
          placeholder="Enter command..."
        />
      </div>

      <style jsx>{`
        .matrix-bg {
          background: radial-gradient(circle, #001100 0%, #000000 100%);
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
}

function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = "01XY";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 opacity-20 pointer-events-none" />;
}