"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Mic, Image as ImageIcon, Film, Globe, Map as MapIcon, X, ArrowUpRight } from "lucide-react";

export default function SearchEngine() {
  return (
    <Suspense fallback={<div className="bg-[#1f1f1f] min-h-screen" />}>
       <SearchInterface />
    </Suspense>
  )
}

function SearchInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "search";
  
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [related, setRelated] = useState([]);
  const [knowledge, setKnowledge] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const hasSearched = !!queryParam;

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam) {
      performFetch(queryParam, typeParam);
    }
  }, [queryParam, typeParam]);

  const performFetch = async (q, type) => {
    setSearching(true);
    setResults([]); 
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
      const data = await res.json();
      setResults(data.results || []);
      setRelated(data.related || []);
      setKnowledge(data.knowledge || null);
    } catch (e) { console.error(e); }
    setSearching(false);
  };

  const handleSearch = (q, type = 'search') => {
    if (!q.trim()) return;
    setShowSuggestions(false);
    router.push(`/?q=${encodeURIComponent(q)}&type=${type}`);
  };

  const handleTyping = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}&type=suggestions`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (e) {}
    } else { setShowSuggestions(false); }
  };

  return (
    <div className={`min-h-screen bg-[#1f1f1f] text-[#e8eaed] font-sans flex flex-col ${hasSearched ? '' : 'justify-center items-center'}`}>
      
      {/* 1. HEADER (Fixed at Top) */}
      <div className={`w-full bg-[#202124] border-b border-[#3c4043] sticky top-0 z-50 ${hasSearched ? 'block' : 'hidden'}`}>
         <div className="flex flex-col md:flex-row items-center p-4 pb-0 gap-4 max-w-[1400px]">
            <span className="text-2xl font-bold tracking-tight cursor-pointer md:mr-8 pb-4 md:pb-0" onClick={() => router.push('/')}>Soumo</span>
            
            <div className="flex-1 w-full max-w-3xl relative pb-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(query, typeParam); }}>
                  <div className="flex items-center bg-[#303134] rounded-full px-4 h-11 shadow-sm border border-transparent focus-within:bg-[#303134] focus-within:shadow-md focus-within:border-white/30 transition-all">
                    <input 
                      className="bg-transparent w-full outline-none text-white text-base" 
                      value={query} 
                      onChange={handleTyping}
                    />
                    {query && <X className="w-5 h-5 text-[#9aa0a6] cursor-pointer mr-3" onClick={() => setQuery("")} />}
                    <div className="border-l border-[#5f6368] h-6 mx-2"></div>
                    <Search className="w-5 h-5 text-[#8ab4f8] cursor-pointer" onClick={() => handleSearch(query, typeParam)}/>
                  </div>
                </form>
                 {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-12 left-0 right-0 bg-[#303134] rounded-b-xl shadow-2xl py-2 z-50 border-x border-b border-[#3c4043]">
                    {suggestions.map((s, i) => (
                      <div key={i} onClick={() => { setQuery(s); handleSearch(s, typeParam); }} className="px-4 py-2 hover:bg-[#3c4043] cursor-pointer text-sm flex gap-3 items-center">
                        <Search size={14} className="text-[#9aa0a6]"/> {s}
                      </div>
                    ))}
                  </div>
                )}
            </div>
         </div>

         {/* TABS (Left Aligned) */}
         <div className="flex gap-2 px-4 md:pl-40 pb-0 overflow-x-auto">
             <Tab active={typeParam === 'search'} onClick={() => handleSearch(query, 'search')} label="All" icon={<Globe size={14}/>} />
             <Tab active={typeParam === 'images'} onClick={() => handleSearch(query, 'images')} label="Images" icon={<ImageIcon size={14}/>} />
             <Tab active={typeParam === 'videos'} onClick={() => handleSearch(query, 'videos')} label="Videos" icon={<Film size={14}/>} />
         </div>
      </div>

      {/* 2. BIG HOME SCREEN */}
      {!hasSearched && (
        <div className="flex flex-col items-center w-full max-w-xl px-4 animate-fade-in -mt-32">
          <h1 className="text-7xl font-bold mb-8 tracking-tighter">Soumo</h1>
          <div className="w-full relative">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
               <div className="flex items-center bg-[#303134] rounded-full h-12 px-5 border border-[#5f6368]/30 hover:bg-[#3c4043] hover:shadow-md transition-all">
                  <Search className="text-[#9aa0a6] w-5 h-5" />
                  <input className="bg-transparent w-full ml-4 outline-none text-white text-base" placeholder="Search..." value={query} onChange={handleTyping} autoFocus />
                  <Mic className="text-[#8ab4f8] w-5 h-5 cursor-pointer" />
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RESULTS AREA (Scrollable) */}
      {hasSearched && (
        <div className="w-full max-w-[1400px] p-4 md:pl-40 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Main Column */}
          <div className="lg:col-span-7 space-y-8 pb-20">
            {searching && <div className="text-[#9aa0a6] animate-pulse">Loading secure nodes...</div>}

            {/* TEXT RESULTS */}
            {!searching && typeParam === 'search' && results.map((r, i) => (
              <div key={i} className="max-w-3xl mb-6">
                <a href={r.url} target="_blank" className="flex items-center gap-2 mb-1 cursor-pointer group">
                     <div className="bg-[#303134] rounded-full p-1 w-7 h-7 flex items-center justify-center">
                        <img src={`https://www.google.com/s2/favicons?domain=${r.source}&sz=32`} className="w-4 h-4" onError={(e) => e.target.style.display='none'}/>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm text-[#dadce0] group-hover:text-white">{r.source}</span>
                        <span className="text-xs text-[#9aa0a6] truncate max-w-[300px]">{r.url}</span>
                     </div>
                </a>
                <a href={r.url} target="_blank" className="text-xl text-[#8ab4f8] hover:underline visited:text-[#c58af9] font-normal block mt-1">{r.title}</a>
                <p className="text-[#bdc1c6] text-sm mt-1 leading-relaxed line-clamp-3">{r.snippet}</p>
              </div>
            ))}

            {/* IMAGE GRID */}
            {!searching && typeParam === 'images' && (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((r, i) => (
                     <a key={i} href={r.url} target="_blank" className="aspect-square bg-[#303134] rounded-lg overflow-hidden group relative block hover:ring-2 ring-[#8ab4f8]">
                        <img src={r.image} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" loading="lazy" />
                        <div className="absolute bottom-0 w-full bg-black/60 p-2 text-xs truncate text-white opacity-0 group-hover:opacity-100 transition-opacity">{r.title}</div>
                     </a>
                  ))}
               </div>
            )}
            
            {/* VIDEO GRID */}
             {!searching && typeParam === 'videos' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((r, i) => (
                     <a key={i} href={r.url} target="_blank" className="bg-[#303134] rounded-xl overflow-hidden group">
                        <div className="aspect-video relative">
                             <img src={r.image} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent"><Film className="text-white"/></div>
                        </div>
                        <div className="p-3">
                            <div className="text-[#8ab4f8] font-medium truncate">{r.title}</div>
                            <div className="text-xs text-[#9aa0a6] mt-1">{r.source}</div>
                        </div>
                     </a>
                  ))}
               </div>
            )}
          </div>

          {/* Sidebar (Knowledge + People Also Ask) */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
             {knowledge && typeParam === 'search' && (
               <div className="border border-[#3c4043] rounded-xl overflow-hidden bg-[#202124]">
                  {knowledge.image && <img src={knowledge.image} className="w-full h-48 object-cover"/>}
                  <div className="p-4">
                     <h2 className="text-2xl font-normal mb-2">{knowledge.title}</h2>
                     <div className="text-sm text-[#bdc1c6] leading-relaxed mb-4">{knowledge.extract}</div>
                     <a href={knowledge.url} target="_blank" className="text-[#8ab4f8] text-sm hover:underline flex gap-1 items-center">Wikipedia <ArrowUpRight size={14}/></a>
                  </div>
               </div>
             )}
             
             {related.length > 0 && typeParam === 'search' && (
               <div className="border border-[#3c4043] rounded-xl p-4 bg-[#202124]">
                  <div className="text-sm font-medium text-[#bdc1c6] mb-3">People also search for</div>
                  <div className="space-y-2">
                     {related.map((q, i) => (
                        <div key={i} onClick={() => handleSearch(q)} className="py-2 border-b border-[#3c4043] last:border-0 text-sm cursor-pointer hover:text-[#8ab4f8] flex justify-between">
                           {q} <Search size={14} className="text-[#5f6368]"/>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}

function Tab({ label, icon, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-2 px-3 py-3 text-sm font-medium cursor-pointer border-b-[3px] transition-colors whitespace-nowrap ${active ? 'text-[#8ab4f8] border-[#8ab4f8]' : 'text-[#9aa0a6] border-transparent hover:text-[#e8eaed]'}`}>
      {icon} <span>{label}</span>
    </div>
  )
}