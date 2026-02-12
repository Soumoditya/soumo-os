"use client";
import { useState } from "react";
import { Mail, Send, FileText, Trash2, Archive, Star, Plus, ArrowLeft, Search, Paperclip, MoreHorizontal } from "lucide-react";

export default function Spail() {
  const [activeFolder, setActiveFolder] = useState("Inbox");
  const [selectedEmail, setSelectedEmail] = useState(null); // The "Reading Pane" logic
  const [isComposeOpen, setComposeOpen] = useState(false); // The "Compose" Modal
  
  // Mock Data
  const [emails, setEmails] = useState([
    { id: 1, from: "System Core", subject: "Neural Link Established", time: "10:00 AM", body: "The connection to the neural interface has been verified. Latency is < 2ms.", folder: "Inbox", read: false },
    { id: 2, from: "Security", subject: "New Login Detected", time: "Yesterday", body: "A login was detected from IP 192.168.1.1. If this was not you, enable lockdown mode.", folder: "Inbox", read: true },
    { id: 3, from: "Soumoditya", subject: "Project Update", time: "Feb 10", body: "We need to push the new updates to the main branch by Friday.", folder: "Sent", read: true },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newEmail = {
        id: Date.now(),
        from: "Me",
        subject: formData.get("subject"),
        body: formData.get("body"),
        time: "Just now",
        folder: "Sent",
        read: true
    };
    setEmails([newEmail, ...emails]);
    setComposeOpen(false);
  };

  const filteredEmails = emails.filter(e => e.folder === activeFolder);

  return (
    <div className="w-full h-full bg-black text-white flex overflow-hidden font-sans">
      
      {/* 1. SIDEBAR (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col w-64 bg-[#0a0a0a] border-r border-white/5 p-4 shrink-0">
          <button onClick={() => setComposeOpen(true)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold mb-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
            <Plus size={18}/> Compose
          </button>
          <div className="space-y-1">
              {["Inbox", "Sent", "Drafts", "Trash"].map(folder => (
                  <button key={folder} onClick={() => { setActiveFolder(folder); setSelectedEmail(null); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${activeFolder === folder ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5'}`}>
                      <span>{folder}</span>
                      {folder === 'Inbox' && <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded text-white">2</span>}
                  </button>
              ))}
          </div>
      </div>

      {/* 2. EMAIL LIST (Visible on Mobile, Left side on Desktop) */}
      <div className={`flex-1 flex flex-col bg-[#050505] min-w-0 ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
          {/* Mobile Header */}
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:hidden shrink-0">
              <span className="font-bold text-lg">{activeFolder}</span>
              <button onClick={() => setComposeOpen(true)} className="p-2 bg-blue-600 rounded-full text-white"><Plus size={20}/></button>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex h-16 border-b border-white/5 items-center px-4 shrink-0">
              <div className="relative w-full">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                  <input placeholder="Search mail..." className="w-full bg-[#111] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 ring-blue-500 outline-none"/>
              </div>
          </div>

          {/* The List */}
          <div className="flex-1 overflow-y-auto">
              {filteredEmails.map(email => (
                  <div key={email.id} onClick={() => setSelectedEmail(email)}
                       className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''}`}>
                      <div className="flex justify-between mb-1">
                          <span className={`text-sm ${!email.read ? 'font-bold text-white' : 'text-gray-400'}`}>{email.from}</span>
                          <span className="text-[10px] text-gray-500">{email.time}</span>
                      </div>
                      <div className={`text-sm mb-1 truncate ${!email.read ? 'text-white font-medium' : 'text-gray-300'}`}>{email.subject}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{email.body}</div>
                  </div>
              ))}
          </div>
          <div className="h-20 md:h-0 shrink-0"></div> {/* Mobile Dock Spacer */}
      </div>

      {/* 3. READING PANE (Overlay on Mobile, Right side on Desktop) */}
      {selectedEmail ? (
          <div className="fixed inset-0 z-20 bg-[#050505] flex flex-col md:static md:w-[600px] md:border-l md:border-white/5 md:bg-[#080808] animate-in slide-in-from-right-10 duration-200">
              {/* Toolbar */}
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <button onClick={() => setSelectedEmail(null)} className="md:hidden p-2 text-gray-400 hover:text-white"><ArrowLeft size={20}/></button>
                  <div className="flex gap-2 ml-auto">
                      <button className="p-2 text-gray-400 hover:bg-white/5 rounded"><Archive size={18}/></button>
                      <button className="p-2 text-gray-400 hover:bg-white/5 rounded"><Trash2 size={18}/></button>
                  </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-xl font-bold text-white mb-4">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{selectedEmail.from[0]}</div>
                      <div>
                          <div className="text-sm font-bold text-white">{selectedEmail.from}</div>
                          <div className="text-xs text-gray-500">To: me • {selectedEmail.time}</div>
                      </div>
                  </div>
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedEmail.body}
                  </div>
              </div>
          </div>
      ) : (
          /* Empty State for Desktop Right Pane */
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-600 bg-[#080808] border-l border-white/5">
              <div className="text-center">
                  <Mail size={48} className="mx-auto mb-4 opacity-20"/>
                  <p>Select an email to read</p>
              </div>
          </div>
      )}

      {/* 4. COMPOSE MODAL */}
      {isComposeOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#161616] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col h-[600px]">
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1a1a] rounded-t-xl">
                      <span className="font-bold">New Message</span>
                      <button onClick={() => setComposeOpen(false)}><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSend} className="flex-1 flex flex-col p-4">
                      <input name="to" placeholder="To" className="bg-transparent border-b border-white/10 py-3 outline-none text-sm"/>
                      <input name="subject" placeholder="Subject" className="bg-transparent border-b border-white/10 py-3 outline-none text-sm font-bold"/>
                      <textarea name="body" placeholder="Write something..." className="flex-1 bg-transparent py-4 outline-none text-sm resize-none" autoFocus></textarea>
                      <div className="flex justify-between items-center pt-4">
                          <button type="button" className="text-gray-500 hover:text-white"><Paperclip size={20}/></button>
                          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                              Send <Send size={14}/>
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}