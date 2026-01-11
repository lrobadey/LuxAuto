
import React, { useState } from 'react';
import { Brand, CarModel, CarVariant } from '../types';
import { Button } from './ui/Button';
import { generateLaunchReviews, generateCarImage } from '../services/geminiService';

interface ShowroomProps {
  brand: Brand;
  models: CarModel[];
  onAddNew: () => void;
  onReset: () => void;
  onBrandUpdate: (brand: Brand) => void;
  onSave: () => void;
  onLoad: () => void;
}

const DIRECTOR_PRESETS = {
  Locations: [
    { label: 'Salt Flats', value: 'on the vast white Bonneville Salt Flats' },
    { label: 'Neo-Tokyo', value: 'in a futuristic cyberpunk city street with neon signs' },
    { label: 'Amalfi Coast', value: 'on a winding cliffside road along the Amalfi Coast' },
    { label: 'Infinite Studio', value: 'in a professional infinite white photography studio' },
    { label: 'French Chateau', value: 'on the gravel driveway of a historic French chateau' },
  ],
  Lighting: [
    { label: 'Golden Hour', value: 'bathed in warm golden hour sunlight' },
    { label: 'Midnight Rain', value: 'at night with heavy rain and reflections' },
    { label: 'Studio High-Key', value: 'with bright commercial studio lighting' },
  ],
  Camera: [
    { label: 'Low Angle', value: 'low angle camera looking up' },
    { label: 'Side Profile', value: 'perfect side profile view' },
    { label: 'Tracking Shot', value: 'high speed tracking shot' },
  ]
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-6 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 relative ${
      active ? 'text-amber-500 bg-amber-500/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>}
  </button>
);

const SpecRow: React.FC<{ label: string; value: string; isHighlight?: boolean }> = ({ label, value, isHighlight }) => (
  <div className={`flex justify-between items-center py-3.5 border-b border-slate-900 transition-colors hover:border-slate-800 ${isHighlight ? 'text-amber-500' : ''}`}>
    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</span>
    <span className={`font-mono text-right pl-4 ${isHighlight ? 'text-sm font-bold' : 'text-xs text-slate-400'}`}>{value}</span>
  </div>
);

export const Showroom: React.FC<ShowroomProps> = ({ 
  brand, 
  models, 
  onAddNew, 
  onReset, 
  onBrandUpdate,
  onSave,
  onLoad
}) => {
  const [activeModel, setActiveModel] = useState<CarModel | null>(models.length > 0 ? models[models.length - 1] : null);
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(
    (models.length > 0 && models[models.length - 1].variants.length > 0) 
      ? models[models.length - 1].variants[0] 
      : null
  );
  
  const [activeTab, setActiveTab] = useState<'specs' | 'gallery' | 'media'>('gallery');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [sessionReviews, setSessionReviews] = useState<Record<string, any[]>>({});

  const handleModelChange = (model: CarModel) => {
    setActiveModel(model);
    setActiveTab('gallery');
    if (model.variants.length > 0) setSelectedVariant(model.variants[0]);
  };

  const handleLaunchVehicle = async () => {
    if (!activeModel) return;
    setIsLaunching(true);
    try {
      const reviews = await generateLaunchReviews(brand, activeModel);
      setSessionReviews(prev => ({ ...prev, [activeModel.id]: reviews }));
    } catch (e) {
      alert("Media launch failed.");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleGenerateNewPhoto = async () => {
    if (!activeModel) return;
    setIsGeneratingPhoto(true);
    try {
      const imageUrl = await generateCarImage(brand, activeModel.visualDescription, customPrompt, activeModel.tier);
      const newVariant = { id: crypto.randomUUID(), prompt: customPrompt, imageUrl, createdAt: Date.now() };
      activeModel.variants.unshift(newVariant);
      setSelectedVariant(newVariant);
      setCustomPrompt('');
    } catch (e) {
      alert("Capture failed.");
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const currentReviews = activeModel ? (activeModel.reviews || sessionReviews[activeModel.id]) : undefined;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in relative bg-slate-950">
      <div className="flex justify-between items-center px-10 py-6 border-b border-white/5 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-40">
        <div className="flex flex-col">
          <h1 className="text-2xl text-white font-serif tracking-[0.2em] leading-none uppercase">{brand.name}</h1>
          <p className="text-amber-500 text-[9px] tracking-[0.5em] uppercase mt-2 font-bold opacity-80">{brand.tagline}</p>
        </div>
        <div className="flex gap-4 items-center">
           <Button variant="ghost" onClick={onLoad} className="text-xs text-slate-500 hover:text-white">Load</Button>
           <Button variant="ghost" onClick={onSave} className="text-xs text-slate-500 hover:text-amber-500">Save</Button>
           <div className="h-8 w-px bg-white/10 mx-2"></div>
           <Button variant="ghost" className="text-xs hover:text-white" onClick={() => setIsDossierOpen(true)}>Archives</Button>
           <Button onClick={onAddNew} className="h-12 px-8">New Build</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-72 border-r border-white/5 bg-black/20 overflow-y-auto p-6 flex-shrink-0">
          <h3 className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-bold mb-8">Active Fleet</h3>
          <div className="space-y-4">
            {models.map(model => (
              <div 
                key={model.id} 
                onClick={() => handleModelChange(model)} 
                className={`p-5 border transition-all duration-500 cursor-pointer group ${
                  activeModel?.id === model.id 
                    ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20' 
                    : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <span className="text-[8px] tracking-[0.3em] uppercase text-slate-500 font-bold block mb-1">{model.tier}</span>
                <div className={`font-serif text-lg tracking-wider ${activeModel?.id === model.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {model.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-slate-950 overflow-y-auto custom-scrollbar">
          {activeModel && (
            <div className="animate-fade-in">
              <div className="relative w-full h-[65vh] bg-black shadow-inner overflow-hidden">
                 {selectedVariant && <img src={selectedVariant.imageUrl} className="w-full h-full object-cover transition-opacity duration-1000" />}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-12 pointer-events-none">
                    <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.6em] mb-4 opacity-0 animate-fade-in" style={{animationDelay: '300ms', animationFillMode: 'forwards'}}>THE PREMIERE OF</span>
                    <h2 className="text-7xl font-serif text-white tracking-tighter mb-3 uppercase leading-none">{activeModel.name}</h2>
                    <p className="text-2xl font-light text-slate-300 italic tracking-wide max-w-2xl">"{activeModel.tagline}"</p>
                 </div>
              </div>

              <div className="flex border-b border-white/10 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-30">
                <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} label="Visual Portfolio" />
                <TabButton active={activeTab === 'specs'} onClick={() => setActiveTab('specs')} label="Technical Manifesto" />
                <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} label="Global Reception" />
              </div>

              {activeTab === 'gallery' && (
                <div className="p-10 space-y-12">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {activeModel.variants.map((v) => (
                      <div 
                        key={v.id} 
                        className={`aspect-video border cursor-pointer overflow-hidden group relative transition-all duration-500 ${
                          selectedVariant?.id === v.id ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800 hover:border-slate-600'
                        }`} 
                        onClick={() => setSelectedVariant(v)}
                      >
                        <img src={v.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                        <div className={`absolute inset-0 bg-amber-500/10 transition-opacity duration-300 ${selectedVariant?.id === v.id ? 'opacity-100' : 'opacity-0'}`}></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-slate-900/30 border border-slate-800/60 p-10 max-w-4xl mx-auto rounded-sm">
                    <h3 className="text-amber-500 text-[10px] uppercase tracking-[0.4em] font-bold mb-8 flex items-center gap-3">
                      <span className="w-2 h-0.5 bg-amber-500"></span> Director's Capture Console
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="md:col-span-2">
                          <textarea 
                            value={customPrompt} 
                            onChange={(e) => setCustomPrompt(e.target.value)} 
                            className="w-full bg-black/40 border border-slate-800 p-5 text-xs text-slate-300 outline-none focus:border-amber-500/50 h-28 resize-none transition-colors placeholder:text-slate-700" 
                            placeholder="Specify environment, lighting, or cinematic directives..." 
                          />
                       </div>
                       <div className="flex flex-col justify-end">
                         <Button onClick={handleGenerateNewPhoto} isLoading={isGeneratingPhoto} className="h-14 font-bold">New Capture</Button>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="p-12 space-y-20 max-w-7xl mx-auto">
                   <div className="max-w-4xl mx-auto space-y-8">
                      <div className="relative pl-12 py-8 bg-slate-900/20 border border-slate-900">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                        <h3 className="text-5xl font-serif text-white mb-8 uppercase tracking-widest leading-tight">The Manifesto</h3>
                        <div className="text-slate-300 text-xl leading-relaxed font-light space-y-6 whitespace-pre-wrap italic">
                          {activeModel.marketingBlurb || "Engineering excellence redefined through the lens of absolute luxury."}
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-4">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-4">I. Powertrain</h4>
                        <div className="space-y-1">
                          <SpecRow label="Power Unit" value={activeModel.specs.engine} />
                          <SpecRow label="Peak Horsepower" value={`${activeModel.specs.horsepower} HP`} isHighlight />
                          <SpecRow label="Torque Output" value={activeModel.specs.torque} />
                          <SpecRow label="0-60 Sprint" value={activeModel.specs.acceleration} isHighlight />
                          <SpecRow label="Top Velocity" value={activeModel.specs.topSpeed} />
                          <SpecRow label="Gearing" value={activeModel.specs.transmission} />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-4">II. Engineering</h4>
                        <div className="space-y-1">
                          <SpecRow label="Drivetrain" value={activeModel.specs.drivetrain} />
                          <SpecRow label="Drag Coefficient" value={activeModel.specs.dragCoefficient} />
                          <SpecRow label="Chassis Type" value={activeModel.specs.chassisConstruction} />
                          <SpecRow label="Suspension" value={activeModel.specs.suspension} />
                          <SpecRow label="Braking" value={activeModel.specs.brakes} />
                          <SpecRow label="Curb Mass" value={activeModel.specs.weight} />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-4">III. Atelier Specs</h4>
                        <div className="space-y-1">
                          <SpecRow label="MSRP (Base)" value={activeModel.price} isHighlight />
                          <SpecRow label="Interior Core" value={activeModel.specs.interiorMaterials} />
                          <SpecRow label="Soundstage" value={activeModel.specs.soundSystem} />
                          <SpecRow label="Wheels" value={activeModel.specs.wheelDesign} />
                          <SpecRow label="Assistance" value={activeModel.specs.driverAssistance} />
                          <SpecRow label="Footprint" value={activeModel.specs.dimensions} />
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="p-16 max-w-7xl mx-auto">
                   {!currentReviews ? (
                     <div className="text-center py-24 border border-dashed border-slate-800 rounded-lg bg-slate-900/10">
                       <p className="text-slate-500 text-sm font-serif mb-8 uppercase tracking-[0.2em]">Awaiting Global Launch Sequence</p>
                       <Button onClick={handleLaunchVehicle} isLoading={isLaunching} className="px-12 h-14">Initiate Media Premiere</Button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {currentReviews.map((r, i) => (
                          <div key={i} className="bg-slate-900/30 border border-slate-800/50 p-10 hover:border-amber-500/20 hover:bg-slate-900/50 transition-all duration-500 group">
                             <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
                               <h4 className="font-serif text-2xl text-white tracking-widest">{r.publication}</h4>
                               <span className="text-amber-500 font-bold text-lg">{r.score}</span>
                             </div>
                             <h3 className="italic mb-6 text-slate-100 text-lg font-light leading-snug">"{r.headline}"</h3>
                             <p className="text-sm text-slate-400 leading-relaxed font-light">{r.summary}</p>
                             <div className="mt-8 pt-6 border-t border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Author: {r.author}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isDossierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-16 overflow-y-auto animate-fade-in">
           <div className="max-w-6xl mx-auto">
             <div className="flex justify-between items-center mb-16 border-b border-amber-500/20 pb-8">
                <div>
                  <h2 className="text-5xl font-serif uppercase tracking-tighter text-white">{brand.name}</h2>
                  <p className="text-amber-500 text-[10px] uppercase tracking-[0.6em] font-bold mt-2">Historical Archives</p>
                </div>
                <button 
                  onClick={() => setIsDossierOpen(false)} 
                  className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-white transition-all"
                >
                  ✕
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {brand.lore?.map((l, i) => (
                 <div key={l.id || i} className="bg-slate-900/20 border border-slate-800 p-10 hover:bg-slate-900/40 hover:border-amber-500/20 transition-all duration-700">
                    <span className="text-amber-500 font-bold font-mono tracking-widest text-lg block mb-4">{l.year}</span>
                    <h3 className="text-2xl text-white mb-6 font-serif uppercase tracking-wide leading-tight">{l.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-light">{l.content}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
