
import React, { useState } from 'react';
import { generateBrandIdentity } from '../services/geminiService';
import { Brand } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface BrandCreatorProps {
  onBrandCreated: (brand: Brand) => void;
}

export const BrandCreator: React.FC<BrandCreatorProps> = ({ onBrandCreated }) => {
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords || !tone) return;

    setIsLoading(true);
    try {
      const brandData = await generateBrandIdentity(keywords, tone);
      const newBrand: Brand = {
        id: crypto.randomUUID(),
        ...brandData
      };
      onBrandCreated(newBrand);
    } catch (error) {
      console.error(error);
      alert("Failed to generate brand identity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl text-amber-500 mb-4 font-serif">The Genesis</h2>
        <p className="text-slate-400 font-light text-lg">Define the soul of your automotive legacy.</p>
        <div className="mt-4 flex items-center justify-center gap-3">
           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-mono text-blue-400 tracking-[0.4em] uppercase font-bold">Pro Reasoning Core Engaged</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/40 p-10 border border-slate-800 backdrop-blur-sm relative group overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-1000"></div>
        
        <div className="space-y-6 relative z-10">
          <Input 
            label="Inspiration Keywords"
            placeholder="e.g. minimalist, brutalist, stealth, italian craftsmanship..." 
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="bg-black/40"
          />
          <Input 
            label="Brand Tone & Vibe"
            placeholder="e.g. Aggressive, Elegant, Futuristic, Understated Luxury..." 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="bg-black/40"
          />
        </div>

        <div className="pt-4 flex justify-center relative z-10">
          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={!keywords || !tone}
            className="w-full h-16 text-md shadow-2xl"
          >
            {isLoading ? 'Synthesizing Identity...' : 'Forge Brand DNA'}
          </Button>
        </div>
      </form>
      
      <div className="mt-8 text-center text-[8px] text-slate-600 font-mono tracking-[0.3em] uppercase">
        Advanced Reasoning & Visual Synthesis Protocol Active
      </div>
    </div>
  );
};
