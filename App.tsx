import React, { useState, useRef } from 'react';
import { ViewState, Brand, CarModel } from './types';
import { BrandCreator } from './components/BrandCreator';
import { BrandHub } from './components/BrandHub';
import { ModelStudio } from './components/ModelStudio';
import { Showroom } from './components/Showroom';
import { Button } from './components/ui/Button';
import type { SaveSlot } from './services/archiveStore';
import { useArchiveVault } from './services/useArchiveVault';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.WELCOME);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<CarModel[]>([]);
  
  // Save/Load State
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    savedBrands,
    notice,
    setNotice,
    saveCurrent,
    deleteSave,
    exportArchives,
    importArchives
  } = useArchiveVault();

  const handleSave = async () => {
    if (!brand) return;
    await saveCurrent(brand, models);
  };

  const handleLoad = (slot: SaveSlot) => {
    if (window.confirm(`Load legacy "${slot.name}"? Unsaved progress will be lost.`)) {
      if (!slot.brand || !Array.isArray(slot.models)) {
        setNotice({ tone: 'error', message: 'Archive data is incomplete and cannot be loaded.' });
        return;
      }
      setBrand(slot.brand);
      setModels(slot.models);
      setView(ViewState.SHOWROOM);
      setShowLoadMenu(false);
    }
  };

  const handleDeleteSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Permanently dissolve this legacy?")) {
      await deleteSave(id);
    }
  };

  const handleExportArchives = async () => {
    await exportArchives();
  };

  const handleImportArchives = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importArchives(file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleModelDeleted = (id: string) => {
    setModels(prev => prev.filter(model => model.id !== id));
  };

  const handleReset = () => {
    if (window.confirm("Dissolve this legacy?")) {
      setBrand(null);
      setModels([]);
      setView(ViewState.WELCOME);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 ambient-shift"></div>
      <div className="pointer-events-none absolute inset-0 ambient-grain"></div>
      <div className="pointer-events-none absolute inset-0 ambient-vignette"></div>

      <div className="relative z-10">
        {notice && (
          <div
            className={[
              'px-4 py-3 text-xs md:text-sm text-center border-b flex items-center justify-center gap-3',
              notice.tone === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : '',
              notice.tone === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : '',
              notice.tone === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : ''
            ].join(' ')}
          >
            <span>{notice.message}</span>
            <button
              onClick={() => setNotice(null)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}
        {view === ViewState.WELCOME && (
          <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2583&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 ambient-vignette"></div>
              <div className="absolute -left-1/3 top-0 h-full w-2/3 ambient-sweep opacity-40"></div>
            </div>
            
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
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <Button variant="outline" onClick={handleExportArchives} className="text-xs">
                        Export Archives
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        Import Archives
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        onChange={handleImportArchives}
                        className="hidden"
                      />
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
            onModelDelete={handleModelDeleted}
            onSave={handleSave}
            onLoad={() => {
              setView(ViewState.WELCOME);
              setShowLoadMenu(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
