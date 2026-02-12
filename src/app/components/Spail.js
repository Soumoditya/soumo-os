"use client";
import { useState } from "react";
import { Mail, Send, FileText, Trash2, Archive, Star, Plus } from "lucide-react";

export default function Spail() {
  const [activeFolder, setActiveFolder] = useState("Inbox");

  const folders = [
    { id: "Inbox", icon: <Mail size={18}/>, count: 3 },
    { id: "Sent", icon: <Send size={18}/>, count: 0 },
    { id: "Drafts", icon: <FileText size={18}/>, count: 1 },
    { id: "Archive", icon: <Archive size={18}/>, count: 0 },
    { id: "Trash", icon: <Trash2 size={18}/>, count: 0 },
  ];

  const emails = [
    { id: 1, from: "System", subject: "Welcome to Soumo OS", time: "10:00 AM", preview: "Your system has been successfully initialized...", folder: "Inbox" },
    { id: 2, from: "Security", subject: "New Login Detected", time: "Yesterday", preview: "Login from Chrome on Windows...", folder: "Inbox" },
    { id: 3, from: "Team", subject: "Project Update", time: "Feb 10", preview: "The neural link calibration is complete...", folder: "Inbox" },
  ];

  return (
    <div className="w-full h-full bg-black text-white flex flex-col md:flex-row">
      
      {/* MOBILE: Top Horizontal Slider (The Request) */}
      <div className="md:hidden shrink-0 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar">
           <button className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg">
             <Plus size={20}/>
           </button>
           <div className="w-px h-6 bg-white/10 mx-1"></div>
           {folders.map(folder => (
             <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFolder === folder.id ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400'}`}
             >
                {folder.icon}
                <span>{folder.id}</span>
             </button>
           ))}
        </div>
      </div>

      {/* DESKTOP: Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#0a0a0a] p-4">
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold mb-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
            <Plus size={18}/> Compose
        </button>
        <div className="space-y-1">
            {folders.map(folder => (
                <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${activeFolder === folder.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3">
                        {folder.icon}
                        <span>{folder.id}</span>
                    </div>
                    {folder.count > 0 && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{folder.count}</span>}
                </button>
            ))}
        </div>
      </div>

      {/* EMAIL LIST */}
      <div className="flex-1 overflow-y-auto bg-black">
         {/* Header */}
         <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 sticky top-0 bg-black/80 backdrop-blur-md z-10">
             <h2 className="font-bold text-lg">{activeFolder}</h2>
             <button className="text-gray-500 hover:text-white"><Star size={20}/></button>
         </div>

         {/* List */}
         <div className="p-2">
            {emails.filter(e => e.folder === activeFolder).map(email => (
                <div key={email.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-blue-400 text-sm">{email.from}</span>
                        <span className="text-[10px] text-gray-500">{email.time}</span>
                    </div>
                    <div className="font-medium text-sm text-gray-200 mb-1 group-hover:text-white transition-colors">{email.subject}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{email.preview}</div>
                </div>
            ))}
         </div>
         <div className="h-20 md:h-0"></div>
      </div>
    </div>
  );
}