
import React, { useState, useEffect } from 'react';
import { ViewState, Brand, CarModel } from './types';
import { BrandCreator } from './components/BrandCreator';
import { BrandHub } from './components/BrandHub';
import { ModelStudio } from './components/ModelStudio';
import { Showroom } from './components/Showroom';
import { Button } from './components/ui/Button';

const STORAGE_KEY = 'luxeauto_saves_v1';

interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  brand: Brand;
  models: CarModel[];
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.WELCOME);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<CarModel[]>([]);
  const [hasKey, setHasKey] = useState<boolean>(false);
  
  // Save/Load State
  const [savedBrands, setSavedBrands] = useState<SaveSlot[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
    refreshSaves();
  }, []);

  const refreshSaves = () => {
    try {
      const savesStr = localStorage.getItem(STORAGE_KEY);
      if (savesStr) {
        setSavedBrands(JSON.parse(savesStr));
      }
    } catch (e) {
      console.error("Failed to load saves", e);
    }
  };

  const handleOpenKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true); // Proceed immediately as per instructions
  };

  const handleSave = () => {
    if (!brand) return;
    try {
      const saves = savedBrands.filter(s => s.id !== brand.id);
      const newSave: SaveSlot = {
        id: brand.id,
        name: brand.name,
        timestamp: Date.now(),
        brand: brand,
        models: models
      };

      try {
        const newSaves = [newSave, ...saves];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
        setSavedBrands(newSaves);
        alert("Legacy secured in archive.");
      } catch (quotaError) {
        // Fallback: strip images if storage is full
        console.warn("Storage full, stripping images");
        const minimalBrand = { 
          ...brand, 
          lore: brand.lore?.map(l => ({ ...l, imageUrl: undefined })) 
        };
        const minimalModels = models.map(m => ({
          ...m,
          variants: m.variants.map(v => ({ ...v, imageUrl: '' }))
        }));
        
        const minimalSave = { ...newSave, brand: minimalBrand, models: minimalModels };
        const fallbackSaves = [minimalSave, ...saves];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackSaves));
        setSavedBrands(fallbackSaves);
        alert("Legacy archived (Visual data excluded due to browser storage limits).");
      }
    } catch (e) {
      alert("Archive failed. System storage critical.");
    }
  };

  const handleLoad = (slot: SaveSlot) => {
    if (window.confirm(`Load legacy "${slot.name}"? Unsaved progress will be lost.`)) {
      setBrand(slot.brand);
      setModels(slot.models);
      setView(ViewState.BRAND_HUB);
      setShowLoadMenu(false);
    }
  };

  const handleDeleteSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Permanently dissolve this legacy?")) {
      const newSaves = savedBrands.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
      setSavedBrands(newSaves);
    }
  };

  const handleBrandCreated = (newBrand: Brand) => {
    setBrand(newBrand);
    setView(ViewState.BRAND_HUB);
  };

  const handleBrandUpdated = (updatedBrand: Brand) => {
    setBrand(updatedBrand);
  };

  const handleModelCreated = (newModel: CarModel) => {
    setModels(prev => [...prev, newModel]);
    setView(ViewState.SHOWROOM);
  };

  const handleReset = () => {
    if (window.confirm("Dissolve this legacy?")) {
      setBrand(null);
      setModels([]);
      setView(ViewState.WELCOME);
    }
  };

  if (!hasKey) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-8">
        <div className="max-w-md text-center space-y-8 animate-fade-in">
          <h1 className="text-4xl font-serif text-white tracking-widest uppercase">Atelier Authorization</h1>
          <p className="text-slate-400 leading-relaxed">
            To unlock the high-fidelity <span className="text-amber-500 font-bold uppercase">Imagen AI Rendering Engine</span> and advanced engineering capabilities, please connect your secure Gemini API key.
          </p>
          <div className="space-y-4">
            <Button onClick={handleOpenKey} className="w-full py-4 text-lg">Connect Secure API Key</Button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em]">Billing & API Requirements</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      {view === ViewState.WELCOME && (
        <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2583&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          
          <div className="z-10 text-center space-y-6 p-8 max-w-3xl animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">
              LUXE<span className="text-amber-500">AUTO</span> ATELIER
            </h1>
            <p className="text-xl text-slate-400 font-light max-w-xl mx-auto border-t border-slate-800 pt-6 uppercase tracking-widest">
              The world's premier digital automotive design studio.
            </p>
            <div className="pt-8 flex flex-col items-center gap-4">
              <Button onClick={() => setView(ViewState.BRAND_CREATION)} className="text-lg px-12 py-4 shadow-xl shadow-amber-500/20">
                Enter The Atelier
              </Button>
              {savedBrands.length > 0 && (
                <button 
                  onClick={() => setShowLoadMenu(true)} 
                  className="text-slate-500 hover:text-amber-500 text-xs uppercase tracking-[0.2em] font-bold transition-colors"
                >
                  Access Archives ({savedBrands.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoadMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
               <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Select Archive</h2>
               <button onClick={() => setShowLoadMenu(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {savedBrands.map(slot => (
                <div 
                  key={slot.id} 
                  onClick={() => handleLoad(slot)}
                  className="p-6 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 cursor-pointer transition-all group relative"
                >
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-xl font-serif text-white mb-1 group-hover:text-amber-500 transition-colors">{slot.name}</h3>
                       <p className="text-xs text-slate-500 font-mono">{new Date(slot.timestamp).toLocaleString()}</p>
                     </div>
                     <span className="text-[10px] uppercase tracking-widest bg-slate-950 px-2 py-1 border border-slate-800 text-slate-400">
                       {slot.models.length} Models
                     </span>
                   </div>
                   <button 
                     onClick={(e) => handleDeleteSave(e, slot.id)}
                     className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                     title="Delete Archive"
                   >
                     🗑️
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === ViewState.BRAND_CREATION && (
        <div className="min-h-screen flex items-center justify-center p-4">
           <BrandCreator onBrandCreated={handleBrandCreated} />
        </div>
      )}

      {view === ViewState.BRAND_HUB && brand && (
        <div className="min-h-screen flex flex-col pt-20">
          <BrandHub 
            brand={brand} 
            onUpdate={handleBrandUpdated} 
            onProceed={() => setView(ViewState.MODEL_STUDIO)} 
            onSave={handleSave}
          />
        </div>
      )}

      {view === ViewState.MODEL_STUDIO && brand && (
        <div className="min-h-screen flex flex-col pt-20">
          <ModelStudio brand={brand} existingModels={models} onModelCreated={handleModelCreated} onBack={() => setView(ViewState.BRAND_HUB)} />
        </div>
      )}

      {view === ViewState.SHOWROOM && brand && (
        <div className="h-screen">
          <Showroom 
            brand={brand} 
            models={models} 
            onAddNew={() => setView(ViewState.MODEL_STUDIO)} 
            onReset={handleReset} 
            onBrandUpdate={handleBrandUpdated}
            onSave={handleSave}
            onLoad={() => setShowLoadMenu(true)}
          />
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
    </div>
  );
};

export default App;
