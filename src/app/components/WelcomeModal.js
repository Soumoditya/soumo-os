"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function WelcomeModal({ onAccept }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onAccept, 800);
  };

  return (
    // Main Container with Flex Column and Justify Center for perfect vertical alignment
    <div className={`fixed inset-0 z-[9999] bg-black text-white font-sans flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* 1. THE SLOW WARP SPEED ENGINE */}
      <WarpField />

      {/* 2. VIGNETTE OVERLAY (Focuses eyes on center) */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/50 to-black pointer-events-none"></div>

      {/* 3. MAIN CONTENT (Centered automatically by parent flex container) */}
      <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${exiting ? 'scale-150 blur-md' : 'scale-100 blur-0'}`}>
        
        {/* TYPOGRAPHY - Pure White & Crisp */}
        {/* Removed MB-8 to tighten spacing slightly now that logo is gone */}
        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter mb-6 cursor-default select-none text-white drop-shadow-2xl">
          Soumo OS
        </h1>

        <p className="text-gray-400 text-lg md:text-xl tracking-wide font-light mb-12 max-w-lg">
          <span className="text-white font-medium">System Online.</span> Awaiting input.
        </p>

        {/* BUTTON - High Tech Shimmer */}
        <button 
          onClick={handleEnter}
          className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white text-black px-10 font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
        >
          {/* Reverse Shimmer (Dark beam on white button) */}
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-black/10"></div>
          </div>
          
          <span className="flex items-center gap-3 text-sm tracking-[0.2em] uppercase z-10">
            Initialize <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </span>
        </button>

      </div>

      <style jsx global>{`
        .bg-radial-gradient {
            background: radial-gradient(circle at center, transparent 10%, #000 100%);
        }
      `}</style>
    </div>
  );
}

// --- WARP FIELD CANVAS ENGINE (SLOWED DOWN) ---
function WarpField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    class Star {
      constructor() {
        this.x = Math.random() * width - width / 2;
        this.y = Math.random() * height - height / 2;
        this.z = Math.random() * width; 
        this.pz = this.z; 
      }

      update(speed, mouseX, mouseY) {
        this.z = this.z - speed;
        if (this.z < 1) {
          this.z = width;
          this.x = Math.random() * width - width / 2;
          this.y = Math.random() * height - height / 2;
          this.pz = this.z;
        }
        // Subtle steering feel
        this.x += (mouseX - width/2) * 0.002;
        this.y += (mouseY - height/2) * 0.002;
      }

      draw() {
        let x = (this.x / this.z) * width + width / 2;
        let y = (this.y / this.z) * height + height / 2;
        let radius = (1 - this.z / width) * 2.5; // Slightly smaller max size for cleaner look

        let px = (this.x / this.pz) * width + width / 2;
        let py = (this.y / this.pz) * height + height / 2;
        
        this.pz = this.z;

        // Draw Streak
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.lineWidth = radius;
        let alpha = (1 - this.z / width) * 0.8; // Reduced maximum brightness for depth
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke();
      }
    }

    const stars = Array.from({ length: 800 }, () => new Star()); 
    let mouse = { x: width/2, y: height/2 };

    const handleMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // --- SPEED CONTROL ---
      // Changed from 25 to 8 for a much slower, majestic feel.
      let speed = 8; 

      stars.forEach(star => {
        star.update(speed, mouse.x, mouse.y);
        star.draw();
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-black" />;
}