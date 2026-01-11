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
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
      }
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
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
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

  const handleModelUpdated = (updatedModel: CarModel) => {
    setModels(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m));
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
            <p className="text-xl text-slate-400 font-light max-w-xl mx-auto border-t border-slate-800 pt-8 mt-8">
              The world's premier AI-powered automotive design suite. Define your legacy.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
              <Button onClick={() => setView(ViewState.BRAND_CREATION)} className="h-16 px-12 text-lg shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                Initialize New Brand
              </Button>
              {savedBrands.length > 0 && (
                <Button variant="outline" onClick={() => setShowLoadMenu(true)} className="h-16 px-12 text-lg">
                  Access Archives ({savedBrands.length})
                </Button>
              )}
            </div>
          </div>

          {showLoadMenu && (
            <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
               <div className="max-w-2xl w-full">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                     <h2 className="text-2xl font-serif text-white">Archived Legacies</h2>
                     <button onClick={() => setShowLoadMenu(false)} className="text-slate-500 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {savedBrands.map(slot => (
                      <div key={slot.id} className="bg-slate-900/40 p-6 border border-slate-800 flex justify-between items-center hover:border-amber-500/30 transition-all group">
                         <div>
                            <h3 className="text-xl font-serif text-white mb-1 group-hover:text-amber-500 transition-colors">{slot.name}</h3>
                            <p className="text-xs text-slate-500 font-mono">{new Date(slot.timestamp).toLocaleDateString()} • {slot.models.length} Models</p>
                         </div>
                         <div className="flex gap-4">
                            <Button onClick={() => handleLoad(slot)} variant="outline" className="text-xs">Load</Button>
                            <button onClick={(e) => handleDeleteSave(e, slot.id)} className="text-slate-600 hover:text-red-500 transition-colors">🗑️</button>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {view === ViewState.BRAND_CREATION && (
        <BrandCreator onBrandCreated={handleBrandCreated} />
      )}

      {view === ViewState.BRAND_HUB && brand && (
        <BrandHub 
          brand={brand} 
          onUpdate={handleBrandUpdated}
          onProceed={() => setView(ViewState.MODEL_STUDIO)}
          onSave={handleSave}
        />
      )}

      {view === ViewState.MODEL_STUDIO && brand && (
        <ModelStudio 
          brand={brand} 
          existingModels={models}
          onModelCreated={handleModelCreated}
          onBack={() => setView(ViewState.BRAND_HUB)}
        />
      )}

      {view === ViewState.SHOWROOM && brand && (
        <Showroom 
          brand={brand} 
          models={models}
          onAddNew={() => setView(ViewState.MODEL_STUDIO)}
          onReset={handleReset}
          onBrandUpdate={handleBrandUpdated}
          onModelUpdate={handleModelUpdated}
          onSave={handleSave}
          onLoad={() => {
            setView(ViewState.WELCOME);
            setShowLoadMenu(true);
          }}
        />
      )}
    </div>
  );
};

export default App;