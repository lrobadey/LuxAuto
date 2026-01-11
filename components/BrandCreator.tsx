
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/40 p-8 border border-slate-800 backdrop-blur-sm">
        <div className="space-y-6">
          <Input 
            label="Inspiration Keywords"
            placeholder="e.g. minimalist, brutalist, stealth, italian craftsmanship..." 
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <Input 
            label="Brand Tone & Vibe"
            placeholder="e.g. Aggressive, Elegant, Futuristic, Understated Luxury..." 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
        </div>

        <div className="pt-4 flex justify-center">
          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={!keywords || !tone}
            className="w-full md:w-auto min-w-[200px]"
          >
            {isLoading ? 'Fabricating Identity...' : 'Forge Brand'}
          </Button>
        </div>
      </form>
      
      <div className="mt-8 text-center text-xs text-slate-500 font-mono">
        POWERED BY GEMINI 3 FLASH & IMAGEN 3
      </div>
    </div>
  );
};
