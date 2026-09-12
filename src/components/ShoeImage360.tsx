import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Sparkles, MoveHorizontal, Check } from 'lucide-react';

interface ShoeImage360Props {
  src: string;
  alt: string;
  sku: string;
  className?: string;
  isHero?: boolean;
}

export const ShoeImage360: React.FC<ShoeImage360Props> = ({
  src,
  alt,
  sku,
  className = '',
  isHero = false,
}) => {
  const [rotationY, setRotationY] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastXRef = useRef<number>(0);
  const spinIntervalRef = useRef<any>(null);

  // Smooth auto-spin animation loop when toggled
  useEffect(() => {
    if (isAutoSpinning) {
      spinIntervalRef.current = setInterval(() => {
        setRotationY((prev) => (prev + 2) % 360);
      }, 16);
    } else {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    }
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, [isAutoSpinning]);

  // Handle pointer down (Mouse & Mobile Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setIsAutoSpinning(false);
    setHasInteracted(true);
    setShowHint(true);
    lastXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Handle pointer move for drag rotation
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) {
      // Subtle 3D perspective tilt on hover
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const yOffset = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        setTiltX(-yOffset * 8);
      }
      return;
    }

    const deltaX = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;

    // Rotate horizontally in 3D
    setRotationY((prev) => {
      const next = (prev + deltaX * 1.2) % 360;
      return next < 0 ? next + 360 : next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (err) {}
      setTimeout(() => setShowHint(false), 1500);
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setTiltX(0);
    }
  };

  // Toggle 360 degree spin button
  const handleToggle360 = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);

    if (isAutoSpinning) {
      setIsAutoSpinning(false);
    } else {
      setIsAutoSpinning(true);
      // If idle, do a continuous smooth 360 spin
    }
  };

  // Reset to original angle
  const handleResetAngle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoSpinning(false);
    setRotationY(0);
    setTiltX(0);
  };

  // Calculate dynamic lighting reflection offset based on rotation
  const shineOffset = ((rotationY % 360) / 360) * 100;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center ${className}`}
      style={{ perspective: '1000px', touchAction: 'none' }}
      title="Drag left or right to rotate 360°"
    >
      {/* 3D Rotating Container */}
      <div
        className="w-full h-full flex items-center justify-center relative transition-transform"
        style={{
          transform: `rotateY(${rotationY}deg) rotateX(${tiltX}deg) scale(${isDragging ? 1.04 : 1})`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {/* Main Shoe Image */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center pointer-events-none drop-shadow-2xl"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic 3D Studio Light Sheen Effect during rotation */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
          style={{
            background: `linear-gradient(105deg, transparent ${shineOffset - 25}%, rgba(255,255,255,0.7) ${shineOffset}%, transparent ${shineOffset + 25}%)`,
          }}
        />
      </div>

      {/* 360 Degree Corner Badge Button */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleToggle360}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold tracking-wide transition-all shadow-lg backdrop-blur-md border ${
            isAutoSpinning
              ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400/40 animate-pulse'
              : 'bg-stone-950/85 hover:bg-stone-900 text-amber-400 border-stone-700/80 hover:border-amber-400/60'
          }`}
          title={isAutoSpinning ? 'Click to Pause 360° Spin' : 'Click to Auto-Spin 360°'}
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${isAutoSpinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
          />
          <span>360° 3D</span>
        </button>

        {rotationY !== 0 && !isAutoSpinning && (
          <button
            type="button"
            onClick={handleResetAngle}
            className="px-2 py-1 rounded-lg text-[10px] font-mono bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors"
            title="Reset to front view"
          >
            Reset
          </button>
        )}
      </div>

      {/* Interactive Helper Overlay (Shows when dragging or on click) */}
      {showHint && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-stone-950/90 border border-stone-700 text-amber-300 rounded-full text-[10px] font-medium shadow-xl backdrop-blur-sm animate-fade-in">
          <MoveHorizontal className="w-3 h-3 animate-pulse" />
          <span>Drag left / right to spin 360° ({Math.round(rotationY)}°)</span>
        </div>
      )}
    </div>
  );
};
