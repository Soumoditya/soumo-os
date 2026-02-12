"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic'; 
import WelcomeModal from "./components/WelcomeModal";
import Dock from "./components/Dock";
import StatusBar from "./components/StatusBar"; 
import SearchEngine from "./components/SearchEngine";
import Spail from "./components/Spail";
import Sys from "./components/Sys";
import Vault from "./components/Vault";
import Terminal from "./components/Terminal";
import CodeStudio from "./components/CodeStudio"; 

// Dynamic Import for Maps to prevent SSR issues
const Maps = dynamic(() => import("./components/Maps"), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-gray-500 gap-4">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-xs font-mono tracking-widest">ESTABLISHING SATELLITE LINK...</div>
    </div>
  )
});

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  // --- 1. GLOBAL PATCH SYSTEM (GOD MODE) ---
  // Runs injected scripts from Code Studio
  useEffect(() => {
    const globalPatch = localStorage.getItem("soumo_global_patch");
    if (globalPatch) {
      try {
        eval(globalPatch);
        console.log("System patched by Admin.");
      } catch (e) {
        console.error("Patch failed:", e);
      }
    }
  }, []);

  // --- 2. BROWSER NAVIGATION LOGIC ---
  // Makes the browser Back button work within the OS
  useEffect(() => {
    if (!isAuthorized) return;

    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('search');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthorized]);

  // Main App Switcher
  const switchApp = (tabName) => {
    if (tabName === activeTab) return;
    setActiveTab(tabName);
    window.history.pushState({ tab: tabName }, '', `?app=${tabName}`);
  };

  return (
    <main className="h-screen w-full relative bg-[#050505] text-white overflow-hidden selection:bg-blue-500/30 font-sans">
      
      {/* Background Layer (Targetable by Code Studio via ID) */}
      <div id="os-background" className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-blob opacity-40"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] animate-blob animation-delay-4000 opacity-40"></div>
      </div>

      {/* Login Screen */}
      {!isAuthorized && <WelcomeModal onAccept={() => setIsAuthorized(true)} />}

      {/* Main Interface */}
      {isAuthorized && (
        <div className="relative z-10 h-full flex flex-col animate-fade-in">
          
          {/* THE ROOF: Status Bar */}
          {/* IMPORTANT: Passing switchApp function so buttons work */}
          <StatusBar onOpenApp={switchApp} />
          
          {/* App Container */}
          {/* pt-10 creates space for the transparent status bar */}
          <div className="flex-1 w-full h-full overflow-hidden relative pt-10">
            
            {activeTab === 'search' && (
              <div className="w-full h-full animate-fade-in">
                <SearchEngine />
              </div>
            )}

            {activeTab === 'mail' && (
              <div className="w-full h-full bg-[#0b0b0b] animate-fade-in">
                <Spail />
              </div>
            )}

            {activeTab === 'system' && (
              <div className="w-full h-full bg-[#0a0a0a] animate-fade-in">
                <Sys onExit={() => switchApp('search')} />
              </div>
            )}

            {activeTab === 'maps' && (
               <div className="w-full h-full bg-[#050505] animate-fade-in">
                  <Maps />
               </div>
            )}

            {activeTab === 'drive' && (
               <div className="w-full h-full bg-[#050505] animate-fade-in">
                  <Vault />
               </div>
            )}

            {activeTab === 'terminal' && (
               <div className="w-full h-full bg-[#0d0d0d] animate-fade-in">
                  <Terminal 
                    onClose={() => switchApp('search')} 
                    onOpenApp={(appId) => switchApp(appId)} 
                  />
               </div>
            )}

            {activeTab === 'code' && (
               <div className="w-full h-full bg-[#1e1e1e] animate-fade-in">
                  <CodeStudio />
               </div>
            )}

          </div>

          {/* Bottom Dock */}
          <Dock activeTab={activeTab} setActiveTab={switchApp} />
        </div>
      )}

    </main>
  );
}