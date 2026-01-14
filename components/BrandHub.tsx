
import React, { useState, useEffect } from 'react';
import { Brand, LoreEntry } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { enrichBrandHistory, generateBrandLore, generateAdditionalLore, generateLoreImage } from '../services/geminiService';

interface BrandHubProps {
  brand: Brand;
  onUpdate: (brand: Brand) => void;
  onProceed: () => void;
  onSave: () => void;
}

const ICONS = ["💠", "🧬", "🏛️", "🗝️", "📜", "💎", "🌌", "⚖️"];

export const BrandHub: React.FC<BrandHubProps> = ({ brand, onUpdate, onProceed, onSave }) => {
  const [localBrand, setLocalBrand] = useState<Brand>(brand);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isLoadingLore, setIsLoadingLore] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [visualizingId, setVisualizingId] = useState<string | null>(null);

  // CRITICAL FIX: Sync internal state whenever the brand prop or its lore changes
  useEffect(() => {
    setLocalBrand(brand);
  }, [brand]);

  const handleChange = (field: keyof Brand, value: any) => {
    const updated = { ...localBrand, [field]: value };
    setLocalBrand(updated);
    onUpdate(updated);
  };

  const sortLore = (lore: LoreEntry[]) => {
    return [...lore].sort((a, b) => {
      const yearA = parseInt((a.year || '').replace(/\D/g, '')) || 0;
      const yearB = parseInt((b.year || '').replace(/\D/g, '')) || 0;
      return yearA - yearB;
    });
  };

  const handleEnrichHistory = async () => {
    setIsEnriching(true);
    try {
      const newHistory = await enrichBrandHistory(localBrand);
      handleChange('history', newHistory);
    } catch (error) {
      console.error(error);
      alert("Failed to expand brand narrative.");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleOpenArchives = async () => {
    setIsDossierOpen(true);
    if (!localBrand.lore || localBrand.lore.length === 0) {
      setIsLoadingLore(true);
      try {
        const lore = await generateBrandLore(localBrand);
        const sortedLore = sortLore(lore);
        handleChange('lore', sortedLore);
      } catch (error) {
        console.error("Lore Generation Error:", error);
        alert("Failed to access archives.");
      } finally {
        setIsLoadingLore(false);
      }
    }
  };

  const handleGenerateMoreLore = async () => {
    if (!localBrand.lore) return;
    setIsGeneratingMore(true);
    try {
        const existingTitles = localBrand.lore.map(l => l.title);
        const newLore = await generateAdditionalLore(localBrand, existingTitles);
        const updatedLore = sortLore([...localBrand.lore, ...newLore]);
        handleChange('lore', updatedLore);
    } catch (error) {
        console.error(error);
        alert("Decryption failed.");
    } finally {
        setIsGeneratingMore(false);
    }
  };

  const handleVisualizeLore = async (entry: LoreEntry) => {
    setVisualizingId(entry.id);
    try {
      const imageUrl = await generateLoreImage(localBrand, entry);
      const updatedLore = localBrand.lore?.map(l => 
        l.id === entry.id ? { ...l, imageUrl } : l
      );
      if (updatedLore) handleChange('lore', updatedLore);
    } catch (error) {
      console.error(error);
      alert("Visual reconstruction failed.");
    } finally {
      setVisualizingId(null);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto w-full p-6 animate-fade-in space-y-12 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800/60 pb-10 gap-8">
          <div className="space-y-2">
            <h2 className="text-[10px] text-amber-500 tracking-[0.5em] uppercase font-bold opacity-80">Design Headquarters</h2>
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">{localBrand.name}</h1>
            <p className="text-slate-400 italic font-light tracking-wide">"{localBrand.tagline}"</p>
          </div>
          <div className="flex gap-4">
             <Button onClick={onSave} variant="ghost" className="h-12 hover:text-amber-500">Save Progress</Button>
             <Button onClick={handleOpenArchives} variant="outline" className="min-w-[160px] h-12">Archives</Button>
             <Button onClick={onProceed} className="min-w-[200px] h-12">Initialize Studio</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-slate-900/20 p-10 border border-slate-800/40 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                <span className="w-8 h-px bg-amber-500/30"></span> Visual Philosophy
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 block font-bold">Aesthetic Identity</label>
                  <textarea 
                    className="w-full bg-black/40 border border-slate-800 p-5 text-slate-300 outline-none focus:border-amber-500/50 h-36 resize-none transition-colors leading-relaxed"
                    value={localBrand.designPhilosophy}
                    onChange={(e) => handleChange('designPhilosophy', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Signature Logo Style" 
                    value={localBrand.logoStyle}
                    onChange={(e) => handleChange('logoStyle', e.target.value)}
                    className="bg-black/40"
                  />
                  <div className="space-y-3">
                     <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Brand Spectrum</label>
                     <div className="flex gap-3">
                        {localBrand.colors.map((c, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                             <input 
                              type="color" 
                              value={c} 
                              onChange={(e) => {
                                const newColors = [...localBrand.colors];
                                newColors[i] = e.target.value;
                                handleChange('colors', newColors);
                              }}
                              className="w-full h-8 bg-transparent border-none cursor-pointer p-0"
                             />
                             <span className="text-[9px] font-mono text-slate-500">{c}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/20 p-10 border border-slate-800/40 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                <span className="w-8 h-px bg-amber-500/30"></span> Legacy Matrix
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <Input 
                    label="Era of Inception" 
                    value={localBrand.establishedYear || ''}
                    onChange={(e) => handleChange('establishedYear', e.target.value)}
                    placeholder="e.g. 1923"
                    className="bg-black/40"
                   />
                   <Input 
                    label="Global Seat" 
                    value={localBrand.headquarters || ''}
                    onChange={(e) => handleChange('headquarters', e.target.value)}
                    placeholder="e.g. Maranello, Italy"
                    className="bg-black/40"
                   />
              </div>

              <div className="relative">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 block flex justify-between font-bold">
                  <span>The Grand Narrative</span>
                  <button 
                    onClick={handleEnrichHistory} 
                    disabled={isEnriching}
                    className="text-amber-500 hover:text-amber-400 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                     {isEnriching ? 'Synthesizing Saga...' : '✨ Expand Mythology (Pro Reasoning)'}
                  </button>
                </label>
                <textarea 
                  className="w-full bg-black/40 border border-slate-800 p-8 text-slate-200 outline-none focus:border-amber-500/50 h-72 resize-none leading-relaxed font-serif text-lg italic transition-all"
                  value={localBrand.history}
                  onChange={(e) => handleChange('history', e.target.value)}
                  placeholder="Draft the foundation..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-amber-500/[0.03] p-10 border border-amber-500/20 sticky top-24">
              <h3 className="text-[10px] text-amber-500 uppercase tracking-[0.5em] mb-8 font-bold">Design DNA</h3>
              <div className="space-y-8">
                 <div className="space-y-3">
                   <h4 className="text-white font-serif text-sm tracking-wide">Materiality</h4>
                   <textarea 
                    className="w-full bg-black/40 border border-slate-800 p-4 text-xs text-slate-300 outline-none focus:border-amber-500/50 h-24 resize-none transition-colors"
                    value={localBrand.materials || ''}
                    onChange={(e) => handleChange('materials', e.target.value)}
                   />
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-white font-serif text-sm tracking-wide">Optical Signature</h4>
                   <textarea 
                    className="w-full bg-black/40 border border-slate-800 p-4 text-xs text-slate-300 outline-none focus:border-amber-500/50 h-24 resize-none transition-colors"
                    value={localBrand.lightingSignature || ''}
                    onChange={(e) => handleChange('lightingSignature', e.target.value)}
                   />
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-white font-serif text-sm tracking-wide">Fluid Dynamics</h4>
                   <textarea 
                    className="w-full bg-black/40 border border-slate-800 p-4 text-xs text-slate-300 outline-none focus:border-amber-500/50 h-24 resize-none transition-colors"
                    value={localBrand.aerodynamics || ''}
                    onChange={(e) => handleChange('aerodynamics', e.target.value)}
                   />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDossierOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div className="max-w-7xl mx-auto p-12 min-h-screen flex flex-col">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-10 mb-16 sticky top-0 bg-slate-950/90 z-50 pt-4 backdrop-blur-md">
              <div className="flex items-center gap-10">
                <div className="w-16 h-16 border border-amber-500/30 flex items-center justify-center text-3xl bg-black/60 shadow-2xl">⚜️</div>
                <div>
                   <h2 className="text-4xl font-serif text-white tracking-[0.2em] uppercase">{localBrand.name}</h2>
                   <p className="text-amber-500 text-[10px] uppercase tracking-[0.6em] mt-3 font-bold opacity-80">Chronological Dossier</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDossierOpen(false)} 
                className="w-14 h-14 flex items-center justify-center border border-slate-800 hover:border-white hover:bg-white hover:text-black transition-all rounded-full group"
              >
                <span className="text-xl transition-transform group-hover:rotate-90">✕</span>
              </button>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full">
              {isLoadingLore ? (
                <div className="h-[60vh] flex flex-col items-center justify-center space-y-12">
                   <div className="w-24 h-0.5 bg-slate-900 relative overflow-hidden">
                      <div className="absolute inset-0 bg-amber-500 animate-[loading_2s_infinite]"></div>
                   </div>
                   <h3 className="text-xs font-mono text-slate-500 tracking-[0.8em] uppercase animate-pulse">Establishing Archive Link</h3>
                </div>
              ) : (
                <div className="relative border-l border-slate-800/60 ml-8 md:ml-20 space-y-24 pb-48">
                  {localBrand.lore && localBrand.lore.map((entry, idx) => (
                    <div key={entry.id || idx} className="relative pl-12 md:pl-20 group animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                       <div className="absolute left-0 -translate-x-[5px] top-0 w-2.5 h-2.5 bg-slate-800 border border-slate-600 rounded-full group-hover:bg-amber-500 group-hover:shadow-[0_0_15px_#f59e0b] transition-all z-10 duration-500"></div>
                       <div className="flex flex-col md:flex-row gap-12">
                         <div className="flex-1 bg-slate-900/30 border border-slate-800/40 p-12 hover:border-amber-500/30 transition-all duration-700 hover:bg-slate-900/50">
                           <div className="flex justify-between items-start mb-8">
                             <span className="text-amber-500 font-bold font-mono text-xl tracking-widest">{entry.year}</span>
                             <span className="text-3xl opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">{ICONS[idx % ICONS.length]}</span>
                           </div>
                           <h3 className="text-3xl font-serif text-white mb-6 uppercase tracking-wide leading-tight">{entry.title}</h3>
                           <p className="text-slate-400 text-lg text-justify leading-relaxed font-light">{entry.content}</p>
                           <div className="mt-10 pt-10 border-t border-slate-800/30">
                              {!entry.imageUrl ? (
                                <button 
                                  onClick={() => handleVisualizeLore(entry)} 
                                  disabled={visualizingId === entry.id} 
                                  className="text-[10px] text-slate-500 hover:text-amber-500 flex items-center gap-4 transition-all uppercase tracking-[0.4em] font-bold"
                                >
                                  {visualizingId === entry.id ? 'Reconstructing Visual Data...' : '👁️ Initiate Optical Reconstruction'}
                                </button>
                              ) : (
                                <div className="w-full aspect-video overflow-hidden border border-slate-800/60 relative group/img shadow-2xl">
                                   <img src={entry.imageUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-1000 scale-105 group-hover/img:scale-100" />
                                </div>
                              )}
                           </div>
                         </div>
                       </div>
                    </div>
                  ))}
                  <div className="pl-12 md:pl-20 pt-12">
                    <Button 
                      onClick={handleGenerateMoreLore} 
                      variant="outline" 
                      isLoading={isGeneratingMore} 
                      className="min-w-[280px] h-14"
                    >
                      Decipher Deep Records
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
};
