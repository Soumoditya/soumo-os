"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Mail, Send, Inbox, File, LogOut, Plus, Search, Settings, 
  X, ChevronLeft, User, Trash2, Reply, Forward, MoreVertical, 
  AlertCircle, Star, Check, Clock, ChevronRight, AlertOctagon, 
  Camera, ImagePlus
} from "lucide-react";

// --- CONFIGURATION ---
const APP_NAME = "Spail";
const DOMAIN = "spail.com"; 

export default function Spail() {
  // App State
  const [user, setUser] = useState(null); 
  const [view, setView] = useState("login"); 
  const [folder, setFolder] = useState("inbox"); 
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeData, setComposeData] = useState(null); 

  // Database State
  const [db, setDb] = useState({ users: [], emails: [] });

  // Load/Init DB & Check SSO
  useEffect(() => {
    const savedData = localStorage.getItem("spail_db_v6");
    if (savedData) {
      const parsedDb = JSON.parse(savedData);
      setDb(parsedDb);
      
      // SSO: Check if already logged in via System
      const activeSession = localStorage.getItem("soumo_auth_session");
      if (activeSession) {
        const foundUser = parsedDb.users.find(u => u.username === activeSession);
        if (foundUser) {
          setUser(foundUser);
          setView("list");
        }
      }
    } else {
      const initialDb = {
        users: [{ username: "admin", password: "123", name: "System Admin", bio: "Root User", avatar: null }],
        emails: [
          { 
            id: 1, from: `system@${DOMAIN}`, to: `admin@${DOMAIN}`, subject: `Welcome to Spail`, 
            body: "System connected. Features:\n- Real Image Uploads\n- Fixed Scrolling\n- Shared Login with Sys", 
            date: new Date().toISOString(), read: false, starred: false, folder: 'inbox'
          }
        ]
      };
      setDb(initialDb);
      localStorage.setItem("spail_db_v6", JSON.stringify(initialDb));
    }
  }, []);

  const saveDb = (newDb) => {
    setDb(newDb);
    localStorage.setItem("spail_db_v6", JSON.stringify(newDb));
  };

  // --- AUTH & USER ---
  const handleLogin = (username, password) => {
    const foundUser = db.users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      setView("list");
      setFolder("inbox");
      localStorage.setItem("soumo_auth_session", username); // Set Shared Session
    } else { alert("Invalid: try admin / 123"); }
  };

  const handleRegister = (username, password, name) => {
    if (db.users.find(u => u.username === username)) return alert("Taken!");
    const newUser = { username, password, name, bio: "New User", avatar: null };
    const newDb = { ...db, users: [...db.users, newUser] };
    saveDb(newDb);
    setUser(newUser);
    setView("list");
    localStorage.setItem("soumo_auth_session", username); // Set Shared Session
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("soumo_auth_session"); // Clear Shared Session
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    const updatedUsers = db.users.map(u => u.username === user.username ? updatedUser : u);
    saveDb({ ...db, users: updatedUsers });
    setUser(updatedUser);
  };

  // --- MAIL ACTIONS ---
  const handleComposeClick = () => {
    setComposeData(null); 
    setView("compose");
  };

  const sendEmail = (to, subject, body, draftIdToDelete = null) => {
    const newEmail = {
      id: Date.now(), from: `${user.username}@${DOMAIN}`, to: to, subject: subject, body: body,
      date: new Date().toISOString(), read: false, starred: false, folder: 'inbox'
    };
    let updatedEmails = [ ...db.emails, { ...newEmail, folder: 'sent' } ];
    if(draftIdToDelete) updatedEmails = updatedEmails.filter(e => e.id !== draftIdToDelete);
    
    saveDb({ ...db, emails: updatedEmails });
    setFolder("sent"); setView("list");
  };

  const handleComposeCancel = (data) => {
    if ((data.to || data.subject || data.body) && !data.id) {
        saveDraft(data.to, data.subject, data.body, null); 
    } else if (data.id && (data.to !== composeData?.to || data.body !== composeData?.body)) {
         saveDraft(data.to, data.subject, data.body, data.id); 
    }
    setView("list");
  };

  const saveDraft = (to, subject, body, id = null) => {
    const draft = {
      id: id || Date.now(), from: `${user.username}@${DOMAIN}`, to: to, subject: subject, body: body,
      date: new Date().toISOString(), read: true, starred: false, folder: 'drafts'
    };
    const updatedEmails = id ? db.emails.map(e => e.id === id ? draft : e) : [draft, ...db.emails];
    saveDb({ ...db, emails: updatedEmails });
    if(!id) setFolder("drafts"); 
  };

  const toggleStar = (e, id) => {
    e.stopPropagation();
    saveDb({ ...db, emails: db.emails.map(e => e.id === id ? { ...e, starred: !e.starred } : e) });
  };

  const moveToTrash = (id) => {
    if (folder === 'trash') {
      if(!confirm("Permanently delete?")) return;
      saveDb({ ...db, emails: db.emails.filter(e => e.id !== id) });
    } else {
      saveDb({ ...db, emails: db.emails.map(e => e.id === id ? { ...e, folder: 'trash' } : e) });
    }
    if(view === 'read') setView('list');
  };

  // --- ROUTER ---
  if (!user) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} domain={DOMAIN} />;
  
  return (
    <div className="w-full h-full bg-[#0b0b0b] flex text-gray-200 font-sans overflow-hidden">
      <Sidebar 
        user={user} setView={setView} setFolder={setFolder} activeFolder={folder} activeView={view}
        onComposeClick={handleComposeClick}
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] m-0 md:m-2 md:rounded-2xl border-0 md:border border-white/5 shadow-2xl overflow-hidden relative">
        {view === "list" && (
          <MailList 
            folder={folder} user={user} emails={db.emails} domain={DOMAIN}
            onSelect={(email) => { 
              if(folder === 'drafts') { setComposeData(email); setView('compose'); } 
              else { setSelectedEmail(email); setView('read'); saveDb({ ...db, emails: db.emails.map(e => e.id === email.id ? { ...e, read: true } : e) }); }
            }}
            onStar={toggleStar}
          />
        )}
        {view === "read" && selectedEmail && (
          <ReadingPane 
            email={selectedEmail} user={user}
            onBack={() => setView('list')} onDelete={() => moveToTrash(selectedEmail.id)}
            onReply={() => { setComposeData({ replyTo: selectedEmail }); setView('compose'); }}
            onStar={(e) => toggleStar(e, selectedEmail.id)} isStarred={db.emails.find(e => e.id === selectedEmail.id)?.starred}
          />
        )}
        {view === "compose" && (
          <Compose 
            user={user} domain={DOMAIN} initialData={composeData}
            onSend={sendEmail} onDraft={saveDraft} onCancel={handleComposeCancel} 
          />
        )}
        {view === "profile" && (
           <ProfilePage user={user} domain={DOMAIN} onBack={() => setView('list')} onUpdate={updateUser} onLogout={handleLogout}/>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AuthScreen({ onLogin, onRegister, domain }) {
  const [isRegister, setIsRegister] = useState(false);
  const [data, setData] = useState({ username: "", password: "", name: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    isRegister ? onRegister(data.username, data.password, data.name) : onLogin(data.username, data.password);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#050505]">
      <div className="w-full max-w-sm p-8 space-y-8 bg-[#121212] rounded-3xl border border-white/10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Mail className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Spail</h2>
          <p className="text-gray-500 text-sm">Secure Private Network</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && <input placeholder="Full Name" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" onChange={e => setData({...data, name: e.target.value})} />}
          <div className="relative"><input placeholder="Username" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors pr-24" onChange={e => setData({...data, username: e.target.value})} /><span className="absolute right-4 top-3.5 text-gray-500 text-sm select-none">@{domain}</span></div>
          <input type="password" placeholder="Password" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" onChange={e => setData({...data, password: e.target.value})} />
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold transition-all shadow-lg shadow-blue-900/20">{isRegister ? "Create ID" : "Enter"}</button>
        </form>
        <p className="text-center text-sm text-gray-500 cursor-pointer hover:text-blue-400" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Have an account? Login" : "Create new account"}
        </p>
      </div>
    </div>
  );
}

function Sidebar({ user, setView, setFolder, activeFolder, activeView, onComposeClick }) {
  return (
    <div className="w-20 md:w-64 bg-[#0b0b0b] flex flex-col p-3 md:p-4 gap-4 flex-shrink-0 relative z-20">
      <div className="flex items-center gap-3 px-2 mb-2 mt-2">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20"><Mail className="text-white w-4 h-4" /></div>
        <span className="text-xl font-bold text-white hidden md:block tracking-tight">Spail</span>
      </div>

      <button onClick={onComposeClick} className="flex items-center gap-3 bg-white text-black hover:bg-gray-200 p-3 md:px-4 md:py-3.5 rounded-2xl transition-all shadow-lg shadow-white/10 group">
        <Plus className="w-6 h-6 text-blue-600 group-hover:rotate-90 transition-transform"/>
        <span className="font-bold hidden md:block">Compose</span>
      </button>

      <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hide">
        <NavBtn icon={<Inbox/>} label="Inbox" active={activeFolder==='inbox' && activeView==='list'} onClick={()=>{setView('list');setFolder('inbox')}} />
        <NavBtn icon={<Star/>} label="Starred" active={activeFolder==='starred' && activeView==='list'} onClick={()=>{setView('list');setFolder('starred')}} />
        <NavBtn icon={<Send/>} label="Sent" active={activeFolder==='sent' && activeView==='list'} onClick={()=>{setView('list');setFolder('sent')}} />
        <NavBtn icon={<File/>} label="Drafts" active={activeFolder==='drafts' && activeView==='list'} onClick={()=>{setView('list');setFolder('drafts')}} />
        <div className="h-px bg-white/5 my-2 mx-4"></div>
        <NavBtn icon={<AlertOctagon/>} label="Spam" active={activeFolder==='spam'} onClick={()=>{setView('list');setFolder('spam')}} />
        <NavBtn icon={<Trash2/>} label="Trash" active={activeFolder==='trash'} onClick={()=>{setView('list');setFolder('trash')}} />
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-2 border border-white/5 flex items-center gap-3 group cursor-pointer hover:bg-[#202020]" onClick={() => setView('profile')}>
         <Avatar user={user} className="w-9 h-9 text-sm" />
         <div className="hidden md:block overflow-hidden flex-1">
           <div className="text-sm text-white font-medium truncate">{user.name}</div>
           <div className="text-[10px] text-gray-500 truncate">@{user.username}</div>
         </div>
      </div>
    </div>
  );
}

const NavBtn = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all group ${active ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {React.cloneElement(icon, { size: 20, className: active ? 'text-blue-400' : 'group-hover:scale-110 transition-transform' })}
    <span className="text-sm hidden md:block">{label}</span>
  </div>
);

function MailList({ folder, user, emails, domain, onSelect, onStar }) {
  const [search, setSearch] = useState("");
  const myEmail = `${user.username}@${domain}`;
  
  const filtered = useMemo(() => {
    return emails.filter(e => {
      if (folder === 'inbox') return e.to === myEmail && e.folder === 'inbox';
      if (folder === 'sent') return e.from === myEmail && e.folder === 'sent';
      if (folder === 'drafts') return e.from === myEmail && e.folder === 'drafts';
      if (folder === 'trash') return e.folder === 'trash' && (e.from === myEmail || e.to === myEmail);
      if (folder === 'spam') return e.folder === 'spam' && e.to === myEmail;
      if (folder === 'starred') return e.starred && (e.to === myEmail || e.from === myEmail);
      return false;
    }).filter(e => (e.subject+e.from+e.body).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [emails, folder, search, myEmail]);

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      <div className="h-16 flex items-center px-4 md:px-6 gap-4 border-b border-white/5 bg-[#121212]/80 backdrop-blur z-10 sticky top-0">
        <h2 className="text-xl font-bold capitalize hidden md:block w-32">{folder}</h2>
        <div className="flex-1 max-w-2xl relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input className="w-full bg-[#1a1a1a] border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none focus:border-blue-500/30 focus:bg-[#202020] focus:shadow-lg transition-all placeholder:text-gray-600" placeholder={`Search ${folder}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600 gap-4 animate-fade-in">
            <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-inner"><Inbox size={48} className="opacity-30"/></div>
            <p className="font-medium">No messages in {folder}</p>
          </div>
        )}
        {filtered.map(email => (
          <div key={email.id} onClick={() => onSelect(email)} className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${email.read ? 'bg-transparent text-gray-400 hover:bg-[#1a1a1a]' : 'bg-[#1a1a1a] text-gray-100 shadow-sm border-white/5 hover:border-blue-500/30'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg ${email.read ? 'bg-[#252525] text-gray-500' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'}`}>
              {folder === 'sent' ? email.to[0].toUpperCase() : email.from[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex justify-between items-center mb-0.5">
                <span className={`truncate text-base ${email.read ? 'font-medium' : 'font-bold text-white'}`}>{folder === 'sent' ? `To: ${email.to}` : email.from}</span>
                <span className="text-xs text-gray-600">{new Date(email.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`truncate flex-1 text-sm ${email.read ? 'text-gray-500' : 'text-gray-300'}`}>{email.subject || "(No Subject)"}</span>
                {!email.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.8)]"></div>}
              </div>
              <div className="text-xs text-gray-600 truncate mt-0.5">{email.body.substring(0, 60)}...</div>
            </div>
            <button onClick={(e) => onStar(e, email.id)} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${email.starred ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-gray-400 group-hover:scale-110'}`}>
              <Star size={16} fill={email.starred ? "currentColor" : "none"}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadingPane({ email, user, onBack, onDelete, onReply, onStar, isStarred }) {
  if (!email) return null;
  const isMe = email.from.includes(user.username);
  return (
    <div className="flex flex-col h-full bg-[#121212] animate-fade-in">
       <div className="h-16 flex items-center px-4 justify-between border-b border-white/5 bg-[#121212]/80 backdrop-blur">
          <div className="flex items-center gap-2">
             <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><ChevronLeft/></button>
             <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
             <button onClick={onDelete} className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-full transition-colors" title="Delete"><Trash2 size={18}/></button>
             <button onClick={onStar} className={`p-2 hover:bg-white/10 rounded-full transition-colors ${isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}><Star size={18} fill={isStarred?"currentColor":"none"}/></button>
          </div>
          <span className="text-xs text-gray-500 font-mono">{new Date(email.date).toLocaleString()}</span>
       </div>
       <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-snug">{email.subject}</h1>
          <div className="flex items-start gap-4 mb-8 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">{email.from[0].toUpperCase()}</div>
             <div className="flex-1">
                <div className="text-white font-bold text-lg">{email.from} <span className="text-gray-500 font-normal text-sm ml-2">{isMe ? '(You)' : ''}</span></div>
                <div className="text-gray-500 text-sm">To: {email.to}</div>
             </div>
             <button onClick={onReply} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"><Reply size={16}/> Reply</button>
          </div>
          <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-7 font-light text-lg">{email.body}</div>
       </div>
    </div>
  )
}

function Compose({ user, domain, initialData, onSend, onDraft, onCancel }) {
  const [to, setTo] = useState(initialData?.to || (initialData?.replyTo ? initialData.replyTo.from : ""));
  const [subject, setSubject] = useState(initialData?.subject || (initialData?.replyTo ? `Re: ${initialData.replyTo.subject}` : ""));
  const [body, setBody] = useState(initialData?.body || (initialData?.replyTo ? `\n\n\n> On ${new Date(initialData.replyTo.date).toLocaleString()}, ${initialData.replyTo.from} wrote:\n> ${initialData.replyTo.body.substring(0, 100)}...` : ""));
  const draftId = initialData?.id || null;

  const handleSubmit = (e) => { e.preventDefault(); let finalTo = to.includes("@") ? to : `${to}@${domain}`; onSend(finalTo, subject, body, draftId); };
  const handleSaveDraft = () => { onDraft(to, subject, body, draftId); onCancel({to, subject, body, id: draftId}); };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-4xl bg-[#18181b] rounded-2xl shadow-2xl border border-white/10 flex flex-col h-[85vh] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#202023]">
          <h3 className="font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> {draftId ? "Edit Draft" : (initialData?.replyTo ? "Reply" : "New Message")}</h3>
          <div className="flex gap-2">
             <button onClick={handleSaveDraft} className="text-gray-400 hover:text-white px-3 py-1.5 text-xs hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"><File size={12}/> Save Draft</button>
             <button onClick={() => onCancel({to, subject, body, id: draftId})} className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"><X size={20}/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-4 bg-[#121212] overflow-hidden">
          <input className="bg-transparent border-b border-white/10 p-2 text-white outline-none placeholder:text-gray-600 focus:border-blue-500 transition-colors" placeholder={`To (@${domain})`} value={to} onChange={e=>setTo(e.target.value)} autoFocus={!draftId && !initialData?.replyTo}/>
          <input className="bg-transparent border-b border-white/10 p-2 text-white outline-none placeholder:text-gray-600 focus:border-blue-500 transition-colors font-medium" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)}/>
          <textarea 
            className="flex-1 bg-transparent resize-none outline-none text-gray-300 leading-relaxed p-2 text-lg overflow-y-auto scrollbar-hide" 
            placeholder="Write something..." 
            value={body} 
            onChange={e=>setBody(e.target.value)}
          />
          <div className="flex justify-end pt-4 border-t border-white/5">
             <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-transform hover:scale-105 active:scale-95"><Send size={18}/> Send Message</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProfilePage({ user, domain, onBack, onUpdate, onLogout }) {
  const [name, setName] = useState(user.name);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ avatar: reader.result }); // Save Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] animate-fade-in">
       <div className="h-16 flex items-center px-4 border-b border-white/5 bg-[#121212]/80 backdrop-blur"><button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"><ChevronLeft/> Back</button></div>
       <div className="flex-1 p-8 flex flex-col items-center pt-10 overflow-y-auto">
          
          {/* AVATAR SECTION */}
          <div className="relative group mb-8">
             <Avatar user={user} className="w-40 h-40 text-6xl ring-4 ring-[#1a1a1a] shadow-2xl" />
             <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => fileInputRef.current.click()}>
               <Camera className="text-white w-10 h-10"/>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
          
          <div className="flex gap-2 mb-8">
             <button onClick={() => fileInputRef.current.click()} className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full hover:bg-blue-600/30">Change Photo</button>
             {user.avatar && <button onClick={() => onUpdate({ avatar: null })} className="text-xs bg-red-600/20 text-red-400 px-3 py-1 rounded-full hover:bg-red-600/30">Remove</button>}
          </div>

          <div className="flex flex-col gap-4 items-center w-full max-w-md">
             <div className="flex items-center gap-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-1 pl-4">
                <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent text-xl font-bold text-white outline-none"/>
                <button onClick={() => onUpdate({name})} className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">Save</button>
             </div>
             <div className="bg-[#1a1a1a] w-full p-4 rounded-xl text-blue-400 font-mono border border-blue-500/20 text-center select-all flex justify-between items-center"><span className="text-gray-500 text-xs uppercase font-bold">ID</span> {user.username}@{domain}</div>
          </div>
          
          <button onClick={onLogout} className="mt-12 flex items-center gap-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-8 py-4 rounded-2xl transition-all font-bold border border-red-600/20 shadow-lg hover:shadow-red-900/20"><LogOut size={20}/> Sign Out Securely</button>
       </div>
    </div>
  )
}

function Avatar({ user, className }) {
  if (user.avatar && user.avatar.startsWith("data:image")) {
    return <img src={user.avatar} alt="Profile" className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-600 to-purple-600 ${className}`}>
      {user.username[0].toUpperCase()}
    </div>
  );
}

// Utility Components
const React = require('react');