import React, { useState, useRef, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, PaletteIcon, CartIcon, BoltIcon } from './Icons';
import { MONKEY_TYPES, MONKEY_COST_MULTIPLIER } from '../constants';

interface HarvestWorldProps {
  bananas: number;
  onHarvest: (amount?: number) => void;
  customBanana?: string;
  onSaveBanana: (dataUrl: string) => void;
  onBuyMonkey: (typeId: string) => void;
  onBuyUpgrade: () => void;
  monkeyCounts: Record<string, number>;
  clickUpgradeLevel: number;
  nextUpgradeCost: number;
  clickValue: number;
  showWinModal: boolean;
  onReset: () => void;
  onPlayFurther: () => void;
  aiMultiplier: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
}

const COLORS = [
  '#FACC15', // Yellow
  '#4ADE80', // Green
  '#A16207', // Brown
  '#000000', // Black
  '#FFFFFF', // White
  'ERASER'   // Eraser
];

const HarvestWorld: React.FC<HarvestWorldProps> = ({ 
  bananas, 
  onHarvest, 
  customBanana, 
  onSaveBanana,
  onBuyMonkey,
  onBuyUpgrade,
  monkeyCounts,
  clickUpgradeLevel,
  nextUpgradeCost,
  clickValue,
  showWinModal,
  onReset,
  onPlayFurther,
  aiMultiplier
}) => {
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#FACC15');
  const [brushSize, setBrushSize] = useState(10);
  const isDrawing = useRef(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdCounter = useRef(0);

  // Initialize Canvas when editing starts
  useEffect(() => {
    if (isEditing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (customBanana) {
          const img = new Image();
          img.src = customBanana;
          img.onload = () => {
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isEditing]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (canvasRef.current) {
       const ctx = canvasRef.current.getContext('2d');
       if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }
    ctx.lineWidth = brushSize;
    if (selectedColor === 'ERASER') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvas = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSaveBanana(dataUrl);
      setIsEditing(false);
    }
  };

  const handleBananaClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    onHarvest(1);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);
    const id = particleIdCounter.current++;
    setParticles(prev => [...prev, { id, x: clientX, y: clientY, value: clickValue }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-yellow-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-10 left-10 text-9xl text-yellow-600 rotate-12 opacity-20">🍌</div>
         <div className="absolute bottom-20 right-10 text-9xl text-green-600 -rotate-12 opacity-20">🌴</div>
         <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="min-h-full flex flex-col">
            
            {/* Clicker Section */}
            <div className="flex flex-col items-center justify-center py-6 relative shrink-0 min-h-[40vh]">
                <h2 className="text-2xl text-yellow-800 font-heading mb-4 animate-float">Harvest Time!</h2>
                
                <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50 transition-colors z-20"
                title="Draw your own banana"
                >
                <PencilIcon className="w-5 h-5" />
                </button>

                <button
                ref={buttonRef}
                onMouseDown={handleBananaClick}
                className={`
                    relative group transition-transform duration-75 ease-in-out outline-none
                    ${isClicking ? 'scale-90' : 'scale-100 hover:scale-105'}
                `}
                style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                }}
                >
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative">
                    {customBanana ? (
                    <img 
                        src={customBanana} 
                        alt="My Custom Banana"
                        className="w-52 h-52 sm:w-64 sm:h-64 object-contain drop-shadow-2xl filter pointer-events-none select-none"
                    />
                    ) : (
                    <div className="w-52 h-52 sm:w-64 sm:h-64 flex flex-col items-center justify-center border-4 border-dashed border-yellow-300 rounded-full bg-yellow-50/50 text-yellow-400">
                        <PaletteIcon className="w-12 h-12 mb-2 opacity-50" />
                        <span className="font-heading text-lg opacity-80">Draw Me!</span>
                    </div>
                    )}
                </div>
                </button>
                <div className="mt-4 bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                   Click Power: {clickValue.toLocaleString()}
                </div>
            </div>

            {/* Shop Section - Split Columns */}
            <div className="bg-white/90 backdrop-blur-md border-t border-yellow-200 p-4 pb-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
                    
                    {/* Left Column: Monkeys */}
                    <div className="flex-1">
                        <h3 className="text-lg font-heading text-slate-800 flex items-center gap-2 mb-3 border-b border-yellow-100 pb-2">
                            <CartIcon className="w-5 h-5 text-yellow-600" />
                            Monkey Market
                        </h3>
                        <div className="space-y-3">
                            {MONKEY_TYPES.map(monkey => {
                                const count = monkeyCounts[monkey.id] || 0;
                                // Dynamic Cost Calculation
                                const currentCost = Math.floor(monkey.cost * Math.pow(MONKEY_COST_MULTIPLIER, count));
                                const canAfford = bananas >= currentCost;
                                
                                // Display dynamic BPS for AI
                                const displayBps = monkey.id === 'ai' 
                                  ? (1 * aiMultiplier).toFixed(0) 
                                  : monkey.bps.toLocaleString();

                                return (
                                    <button
                                        key={monkey.id}
                                        onClick={() => onBuyMonkey(monkey.id)}
                                        disabled={!canAfford}
                                        className={`
                                        w-full flex items-center justify-between p-2 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                                        ${canAfford 
                                            ? 'bg-white border-yellow-400 shadow-sm hover:border-yellow-500 active:scale-[0.98]' 
                                            : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed grayscale-[0.5]'
                                        }
                                        `}
                                    >
                                        <div className="flex items-center gap-2 z-10">
                                            <div className="bg-yellow-50 w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner border border-yellow-100">
                                                {monkey.emoji}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-800 text-sm leading-tight">{monkey.name}</div>
                                                <div className="text-[10px] text-green-600 font-bold bg-green-50 inline-block px-1.5 rounded-full mt-0.5">
                                                    +{displayBps} / sec
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end z-10 pl-2">
                                            <div className={`font-black text-sm ${canAfford ? 'text-yellow-600' : 'text-slate-400'}`}>
                                                {currentCost.toLocaleString()}
                                            </div>
                                            {count > 0 && (
                                                <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded-full">
                                                    #{count}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Upgrades */}
                    <div className="flex-1">
                        <h3 className="text-lg font-heading text-slate-800 flex items-center gap-2 mb-3 border-b border-yellow-100 pb-2">
                            <BoltIcon className="w-5 h-5 text-yellow-600" />
                            Click Upgrades
                        </h3>
                        
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="bg-orange-500 text-white p-3 rounded-lg shadow-md">
                                    <BoltIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Bionic Finger</div>
                                    <div className="text-xs text-slate-500">Upgrade your clicking power x1.5</div>
                                </div>
                             </div>
                             
                             <div className="flex justify-between items-center text-sm mb-4">
                                <span className="text-slate-500">Current Level: <span className="font-bold text-orange-600">{clickUpgradeLevel}</span></span>
                                <span className="text-slate-500">Power: <span className="font-bold text-orange-600">{clickValue.toLocaleString()}</span></span>
                             </div>

                             <button 
                                onClick={onBuyUpgrade}
                                disabled={bananas < nextUpgradeCost}
                                className={`w-full py-3 rounded-lg font-bold shadow-sm transition-all flex justify-between px-4
                                    ${bananas >= nextUpgradeCost 
                                        ? 'bg-orange-500 text-white hover:bg-orange-600 active:translate-y-0.5' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                `}
                             >
                                <span>Upgrade</span>
                                <span>{nextUpgradeCost.toLocaleString()} 🍌</span>
                             </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
      
      {/* Particles Rendering */}
      {particles.map(p => (
        <div
          key={p.id}
          className="floating-number pointer-events-none fixed z-40 text-3xl font-black text-yellow-600 drop-shadow-md"
          style={{ 
            left: p.x, 
            top: p.y - 50, 
            transform: 'translateX(-50%)' 
          }}
        >
          +{p.value}
        </div>
      ))}

      {/* --- DRAWING MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md flex flex-col gap-4 animate-pop">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-heading text-xl text-slate-800">Draw Your Banana</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            {/* Canvas Area... */}
            <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 cursor-crosshair touch-none">
               <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="text-slate-300 text-6xl">🍌</span>
               </div>
               <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full h-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
               />
            </div>
            {/* Controls */}
            <div className="flex flex-col gap-3">
               <div className="flex justify-center gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
                        selectedColor === color ? 'scale-125 border-slate-400 ring-2 ring-slate-200' : 'border-transparent'
                      }`}
                      style={{ 
                        backgroundColor: color === 'ERASER' ? 'white' : color,
                        backgroundImage: color === 'ERASER' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                        backgroundSize: '8px 8px'
                      }}
                      title={color === 'ERASER' ? 'Eraser' : color}
                    >
                      {color === 'ERASER' && <span className="text-[10px] font-bold text-slate-500">X</span>}
                    </button>
                  ))}
               </div>
               <div className="flex items-center gap-2 px-2">
                  <span className="text-xs text-slate-400">Size</span>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-yellow-500"
                  />
               </div>
               <div className="flex gap-2 mt-2">
                  <button 
                    onClick={clearCanvas}
                    className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex justify-center items-center gap-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Clear
                  </button>
                  <button 
                    onClick={saveCanvas}
                    className="flex-[2] py-2 rounded-lg bg-yellow-500 text-white font-bold hover:bg-yellow-600 flex justify-center items-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Save & Use
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WIN MODAL --- */}
      {showWinModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
              <div className="bg-gradient-to-b from-yellow-100 to-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-yellow-400 animate-pop">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h2 className="text-3xl font-heading text-yellow-800 mb-2">Congratulations!</h2>
                  <p className="text-yellow-700 mb-6">You've reached <span className="font-bold">100,000,000 Bananas!</span> You are the ultimate Banana Tycoon.</p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={onPlayFurther}
                          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
                      >
                          Play Further
                      </button>
                      <button 
                          onClick={onReset}
                          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
                      >
                          Reset Game
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HarvestWorld;