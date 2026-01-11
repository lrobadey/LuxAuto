
import React, { useState } from 'react';
import { Brand, CarModel, CarTier, CarVariant } from '../types';
import { generateCarSpecs, generateCarImage } from '../services/geminiService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DEFAULT_TIERS } from '../constants';

interface ModelStudioProps {
  brand: Brand;
  existingModels: CarModel[];
  onModelCreated: (model: CarModel) => void;
  onBack: () => void;
}

const PRESETS = {
  environments: [
    { name: 'Tokyo Night', prompt: 'drifting through a neon-lit Tokyo street at night, wet asphalt reflections' },
    { name: 'Swiss Alps', prompt: 'carving through a snowy mountain pass, bright daylight, cinematic landscape' },
    { name: 'Cyberpunk', prompt: 'futuristic rainy city, massive holograms, purple and teal lighting' },
    { name: 'Sahara', prompt: 'speeding across desert dunes, sunset, dust clouds' },
    { name: 'Monaco', prompt: 'parked outside a luxury casino at dusk, soft golden hour lighting' }
  ],
  finishes: [
    { name: 'Matte Stealth', prompt: 'matte finish paint, non-reflective surfaces' },
    { name: 'Liquid Metallic', prompt: 'ultra-glossy liquid metal paint, high reflections' },
    { name: 'Forged Carbon', prompt: 'exposed forged carbon fiber body details' },
    { name: 'Pearlescent', prompt: 'shifting iridescent pearlescent paint' }
  ],
  angles: [
    { name: 'Front 3/4', prompt: 'dramatic front three-quarter view' },
    { name: 'Side Profile', prompt: 'perfect side profile silhouette' },
    { name: 'Rear/Rear 3/4', prompt: 'low angle rear view, focusing on taillights and diffuser' },
    { name: 'Top Down', prompt: 'dramatic overhead bird-eye view' }
  ]
};

export const ModelStudio: React.FC<ModelStudioProps> = ({ brand, existingModels, onModelCreated, onBack }) => {
  const [selectedTier, setSelectedTier] = useState<CarTier>(CarTier.FLAGSHIP);
  const [customFeatures, setCustomFeatures] = useState('');
  const [activeModel, setActiveModel] = useState<CarModel | null>(null);
  const [variantPrompt, setVariantPrompt] = useState('Studio lighting, 3/4 front view, neutral background, high detail');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);

  const handleCreatePlatform = async () => {
    setIsProcessing(true);
    try {
      const specsData = await generateCarSpecs(brand, selectedTier, customFeatures, existingModels);
      const newModel: CarModel = {
        id: crypto.randomUUID(),
        brandId: brand.id,
        ...specsData,
        tier: selectedTier,
        variants: [],
        isGenerating: false
      };
      setActiveModel(newModel);
    } catch (error) {
      console.error(error);
      alert("Failed to engineer platform.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVariant = async () => {
    if (!activeModel) return;
    setIsProcessing(true);

    try {
      const variantCount = activeModel.variants.length;
      const masterReference = variantCount > 0 
        ? activeModel.variants[variantCount - 1].imageUrl 
        : undefined;
      const latestReference = variantCount > 0 
        ? activeModel.variants[0].imageUrl 
        : undefined;

      const combinedPrompt = [
        selectedAngle ? PRESETS.angles.find(a => a.name === selectedAngle)?.prompt : '',
        selectedEnv ? PRESETS.environments.find(e => e.name === selectedEnv)?.prompt : '',
        selectedFinish ? PRESETS.finishes.find(f => f.name === selectedFinish)?.prompt : '',
        variantPrompt
      ].filter(Boolean).join(', ');

      const imageUrl = await generateCarImage(
        brand,
        activeModel.visualDescription, 
        combinedPrompt,
        activeModel.tier,
        masterReference,
        latestReference
      );
      
      const newVariant: CarVariant = {
        id: crypto.randomUUID(),
        prompt: combinedPrompt,
        imageUrl,
        createdAt: Date.now()
      };

      setActiveModel({
        ...activeModel,
        variants: [newVariant, ...activeModel.variants]
      });
    } catch (error) {
      console.error(error);
      alert("Failed to render concept.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToFleet = () => {
    if (activeModel) onModelCreated(activeModel);
  };

  if (!activeModel) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-12 animate-fade-in py-16">
        <div className="w-full md:w-5/12 space-y-10">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-6 pl-0 gap-2 hover:text-amber-500 transition-colors">
              <span className="text-lg">←</span> Headquarters
            </Button>
            <h2 className="text-5xl font-serif text-white leading-tight tracking-tight">Vehicle Engineering</h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-sm">
              Define the architectural foundation and mechanical soul for a new <span className="text-amber-500 font-bold uppercase tracking-wider">{brand.name}</span> series.
            </p>
          </div>

          <div className="space-y-8 bg-slate-900/20 p-10 border border-slate-800/60 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>
            
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
               <span className="text-[8px] font-mono text-blue-400 tracking-[0.3em] uppercase">Gemini 3 Pro Reasoning Core Active</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-4 block font-bold">Class Segment</label>
              <div className="grid grid-cols-1 gap-3">
                {DEFAULT_TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`text-left px-5 py-3.5 border text-xs tracking-widest uppercase transition-all duration-300 relative ${
                      selectedTier === tier 
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' 
                        : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span className="relative z-10">{tier}</span>
                    {selectedTier === tier && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                  </button>
                ))}
              </div>
            </div>

            <Input 
              label="Engineering Brief"
              placeholder="e.g. Ultra-lightweight Aero, GT focused..." 
              value={customFeatures}
              onChange={(e) => setCustomFeatures(e.target.value)}
              className="bg-black/40 border-slate-800 focus:border-amber-500/50"
            />

            <Button 
              onClick={handleCreatePlatform} 
              isLoading={isProcessing} 
              className="w-full py-5 text-md shadow-2xl shadow-amber-500/5"
            >
              {isProcessing ? 'Thinking Deeply...' : 'Initialize Synthesis'}
            </Button>
          </div>
        </div>

        <div className="w-full md:w-7/12 flex items-center justify-center bg-slate-950/40 border border-slate-900/50 min-h-[500px] relative rounded-lg">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="text-center p-12 space-y-4">
            <div className="text-9xl mb-4 text-slate-900 font-serif select-none opacity-40">Σ</div>
            <h3 className="text-sm text-slate-500 font-serif tracking-[0.5em] uppercase">Core Offline</h3>
            <p className="text-slate-700 text-[10px] font-mono tracking-widest">AWAITING ARCHITECTURAL COMMANDS</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-8 animate-fade-in pb-24 pt-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800/40 pb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 text-amber-500 text-[9px] tracking-[0.5em] uppercase mb-3 font-bold">
             <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-sm">Sync Active</span>
             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
             <span className="text-slate-500">{activeModel.tier} Project</span>
          </div>
          <h1 className="text-6xl font-serif text-white tracking-tight leading-none">{activeModel.name}</h1>
          <p className="text-md text-slate-400 mt-2 italic font-light tracking-wide">"{activeModel.tagline}"</p>
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" onClick={() => setActiveModel(null)} className="hover:text-red-500 text-xs">Abort Project</Button>
           <Button onClick={handleSaveToFleet} disabled={activeModel.variants.length === 0} className="px-10 h-14">
             {activeModel.variants.length === 0 ? 'Initialize Visualizer' : 'Authorize Production'}
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        <div className="w-full lg:w-4/12 space-y-8">
          
          <div className="bg-slate-900/30 border border-slate-800/50 p-8 backdrop-blur-md relative group">
            <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-8 font-bold flex justify-between items-center">
              <span>Technical Summary</span>
              <span className="text-blue-400 font-mono text-[8px]">PRO_REASONING: ENABLED</span>
            </h3>
            <div className="space-y-4 font-mono text-[10px]">
              {[
                { label: 'Market Position', value: activeModel.price },
                { label: 'Powertrain', value: activeModel.specs.engine },
                { label: 'Net Output', value: `${activeModel.specs.horsepower} HP / ${activeModel.specs.torque}` },
                { label: 'Launch', value: `0-60: ${activeModel.specs.acceleration} | Max: ${activeModel.specs.topSpeed}` },
                { label: 'Drivetrain', value: activeModel.specs.drivetrain },
                { label: 'Transmission', value: activeModel.specs.transmission || 'Bespoke' },
                { label: 'Drag Coeff.', value: activeModel.specs.dragCoefficient || '0.22 Cd' },
                { label: 'Construction', value: activeModel.specs.chassisConstruction || 'Carbon Core' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-slate-800/30 pb-3">
                  <span className="text-slate-500 uppercase tracking-tighter">{item.label}</span>
                  <span className="text-slate-200 text-right pl-4 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/20 border border-slate-800/50 p-8 space-y-8">
             <section>
               <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] mb-4 font-bold opacity-80">Environment</h4>
               <div className="flex flex-wrap gap-2">
                 {PRESETS.environments.map(env => (
                   <button
                    key={env.name}
                    onClick={() => setSelectedEnv(selectedEnv === env.name ? null : env.name)}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest border transition-all duration-300 ${
                      selectedEnv === env.name ? 'bg-amber-500 border-amber-500 text-black font-bold' : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                   >
                     {env.name}
                   </button>
                 ))}
               </div>
             </section>

             <section>
               <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] mb-4 font-bold opacity-80">Finish</h4>
               <div className="flex flex-wrap gap-2">
                 {PRESETS.finishes.map(f => (
                   <button
                    key={f.name}
                    onClick={() => setSelectedFinish(selectedFinish === f.name ? null : f.name)}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest border transition-all duration-300 ${
                      selectedFinish === f.name ? 'bg-amber-500 border-amber-500 text-black font-bold' : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                   >
                     {f.name}
                   </button>
                 ))}
               </div>
             </section>

             <section>
               <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] mb-4 font-bold opacity-80">Perspective</h4>
               <div className="flex flex-wrap gap-2">
                 {PRESETS.angles.map(a => (
                   <button
                    key={a.name}
                    onClick={() => setSelectedAngle(selectedAngle === a.name ? null : a.name)}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest border transition-all duration-300 ${
                      selectedAngle === a.name ? 'bg-amber-500 border-amber-500 text-black font-bold' : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                   >
                     {a.name}
                   </button>
                 ))}
               </div>
             </section>

             <section className="pt-6 border-t border-slate-800/50">
               <h4 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-4 font-bold">Additional Directives</h4>
               <textarea 
                className="w-full bg-slate-950/50 border border-slate-800 p-4 text-[11px] text-slate-300 outline-none focus:border-amber-500/50 h-20 resize-none transition-all placeholder:text-slate-700"
                placeholder="Modify lighting detail, focus, or dynamic action..."
                value={variantPrompt}
                onChange={(e) => setVariantPrompt(e.target.value)}
               />
               <Button 
                onClick={handleGenerateVariant} 
                isLoading={isProcessing} 
                className="w-full mt-6 h-14"
                variant="outline"
               >
                 Capture Concept Frame
               </Button>
             </section>
          </div>
        </div>

        <div className="w-full lg:w-8/12">
           {activeModel.variants.length === 0 && !isProcessing ? (
             <div className="w-full aspect-video border border-slate-900 bg-slate-900/10 flex flex-col items-center justify-center text-slate-700 relative group overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)' , backgroundSize: '10px 10px' }}></div>
                <div className="text-7xl mb-6 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">📷</div>
                <p className="font-serif uppercase tracking-[0.6em] text-xs">Visual Feed Standby</p>
             </div>
           ) : (
             <div className="space-y-8">
               <div className="relative w-full aspect-video bg-black border border-slate-800/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  {isProcessing && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                       <div className="w-48 h-0.5 bg-slate-900 mb-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-amber-500 animate-[loading_1.5s_infinite]"></div>
                       </div>
                       <div className="text-[8px] font-mono text-amber-500 tracking-[0.6em] animate-pulse uppercase">PROCESSING_VISUAL_GEOMETRY</div>
                    </div>
                  )}
                  
                  {activeModel.variants.length > 0 && (
                    <img 
                      src={activeModel.variants[0].imageUrl} 
                      alt="Current Variant" 
                      className={`w-full h-full object-cover transition-all duration-1000 ${isProcessing ? 'blur-2xl scale-110 opacity-20' : 'blur-0 scale-100 opacity-100'}`}
                    />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/20 to-transparent">
                    <div className="max-w-xl">
                      <p className="text-[8px] text-amber-500/80 uppercase font-bold tracking-[0.4em] mb-2">Primary Projection</p>
                      <p className="text-xs text-slate-400 font-light italic opacity-90 truncate">{activeModel.variants[0]?.prompt}</p>
                    </div>
                  </div>
               </div>

               {activeModel.variants.length > 1 && (
                 <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                   {activeModel.variants.slice(1).map((variant) => (
                     <div key={variant.id} className="relative aspect-video bg-slate-900 border border-slate-800/40 group cursor-pointer hover:border-amber-500/40 transition-all overflow-hidden">
                        <img src={variant.imageUrl} alt="Ref" className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
