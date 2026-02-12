"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, Navigation, Crosshair, Map as MapIcon, AlertTriangle } from "lucide-react";
import { useDebounce } from "use-debounce";

// Fix Leaflet Icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = L.divIcon({
  className: "user-gps-marker",
  html: '<div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl"><div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function Maps() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 800);
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState([24.1759, 87.7795]); // Default: Rampurhat
  const [userPos, setUserPos] = useState(null);
  const [locationName, setLocationName] = useState("Target Sector");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- PHOTON SEARCH ENGINE (Better for India) ---
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        // Photon API: Much faster and better fuzzy search than Nominatim
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await res.json();
        
        // Map Photon format to our format
        const formatted = data.features.map(f => ({
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          display_name: `${f.properties.name || ''} ${f.properties.street || ''}, ${f.properties.city || f.properties.state || ''}`
        }));
        
        setSuggestions(formatted);
        setShowSuggestions(true);
      } catch (e) {
        console.error("Search failed");
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  // --- ACTIONS ---
  const handleSelectLocation = (lat, lon, name) => {
    setPosition([parseFloat(lat), parseFloat(lon)]);
    setLocationName(name);
    setQuery(name.split(',')[0]); 
    setShowSuggestions(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return alert("GPS Module Missing.");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        
        // INTELLIGENT FILTER: If accuracy is worse than 5km (5000m), it's likely an IP-based location (Kolkata).
        // We reject it to prevent the jump.
        if (accuracy > 5000) {
          alert(`GPS Signal Weak (Error: ${(accuracy/1000).toFixed(1)}km). Keeping current position to prevent drift.`);
          return;
        }

        const newPos = [latitude, longitude];
        setPosition(newPos);
        setUserPos(newPos);
        setLocationName("GPS Locked");
      },
      (err) => alert("Signal Lost. Using last known coordinates."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full h-full relative bg-[#050505] flex flex-col group">
      
      {/* SEARCH BAR */}
      <div className="absolute top-4 left-4 z-[1000] w-full max-w-sm flex flex-col gap-2">
        <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center shadow-2xl p-1">
          <div className="p-3 text-gray-400"><Search size={20}/></div>
          <input 
            className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-gray-500 font-medium"
            placeholder="Search Rampurhat, Shops, Para..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
          {query && <button onClick={() => setQuery("")} className="p-2 text-gray-500 hover:text-white"><Navigation size={16} className="rotate-45"/></button>}
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleSelectLocation(s.lat, s.lon, s.display_name)}
                className="px-4 py-3 text-left text-xs text-gray-200 hover:bg-blue-600/20 hover:text-white border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
              >
                <div className="bg-white/10 p-1.5 rounded-full flex-shrink-0"><MapIcon size={12}/></div>
                <span className="truncate">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LOCATE ME */}
      <div className="absolute bottom-8 right-6 z-[1000]">
        <button 
          onClick={handleLocateMe}
          className="bg-white text-black p-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-4 border-[#0a0a0a]"
        >
          <Crosshair size={24}/>
        </button>
      </div>

      {/* MAP ENGINE */}
      <MapContainer 
        center={position} 
        zoom={17} 
        zoomControl={false} 
        className="w-full h-full z-0 bg-[#0a0a0a]"
      >
        {/* LAYERS CONTROL - MOVED TO TOP RIGHT to fix visibility */}
        <LayersControl position="topright">
          
          {/* 1. GOOGLE HYBRID (Best Detail) */}
          <LayersControl.BaseLayer checked name="Google Hybrid">
            <TileLayer
              url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
              attribution="Google"
              maxNativeZoom={20}
              maxZoom={22}
            />
          </LayersControl.BaseLayer>

          {/* 2. GOOGLE SATELLITE */}
          <LayersControl.BaseLayer name="Google Satellite">
            <TileLayer
              url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
              attribution="Google"
              maxNativeZoom={20}
              maxZoom={22}
            />
          </LayersControl.BaseLayer>

          {/* 3. GOOGLE STREETS */}
          <LayersControl.BaseLayer name="Google Streets">
            <TileLayer
              url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
              attribution="Google"
              maxNativeZoom={20}
              maxZoom={22}
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        <MapUpdater center={position} />
        <Marker position={position} icon={icon}>
          <Popup className="custom-popup font-sans text-xs">
            <b className="block mb-1 text-sm">{locationName.split(',')[0]}</b>
            {locationName}
          </Popup>
        </Marker>
        
        {userPos && <Marker position={userPos} icon={userIcon} />}
        
        {/* Zoom Control is now managed by Leaflet default or custom if needed, 
            but LayersControl takes the top-right spot naturally. */}
        <ZoomControl position="bottomleft" />

      </MapContainer>
    </div>
  );
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 17, { duration: 1.5 });
  }, [center, map]);
  return null;
}