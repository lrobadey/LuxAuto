import { useState } from 'react';
import { Brand, CarModel, CarVariant, Review } from '../types';
import { generateLaunchReviews, generateShowroomCapture, generateBrandLore, generateMarketInsight } from './geminiService';

interface UseShowroomWorkflowArgs {
  brand: Brand;
  models: CarModel[];
  activeModel: CarModel | null;
  onBrandUpdate: (brand: Brand) => void;
  onModelUpdate: (model: CarModel) => void;
  onModelDelete: (id: string) => void;
  setActiveModel: (model: CarModel | null) => void;
  setSelectedVariant: (variant: CarVariant | null) => void;
}

export const useShowroomWorkflow = ({
  brand,
  models,
  activeModel,
  onBrandUpdate,
  onModelUpdate,
  onModelDelete,
  setActiveModel,
  setSelectedVariant
}: UseShowroomWorkflowArgs) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);
  const [isLoadingLore, setIsLoadingLore] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [sessionReviews, setSessionReviews] = useState<Record<string, Review[]>>({});
  const [pendingDelete, setPendingDelete] = useState<CarModel | null>(null);
  const [deletePhrase, setDeletePhrase] = useState('');

  const launchVehicle = async () => {
    if (!activeModel) return;
    setIsLaunching(true);
    try {
      const reviews = await generateLaunchReviews(brand, activeModel);
      const updatedModel = { ...activeModel, reviews };
      setActiveModel(updatedModel);
      onModelUpdate(updatedModel);
      setSessionReviews(prev => ({ ...prev, [activeModel.id]: reviews }));
    } catch (e) {
      alert("Media launch failed.");
    } finally {
      setIsLaunching(false);
    }
  };

  const analyzeMarket = async () => {
    if (!activeModel) return;
    setIsAnalyzingMarket(true);
    try {
      const insight = await generateMarketInsight(brand, activeModel);
      const updatedModel = { ...activeModel, marketInsight: insight };
      setActiveModel(updatedModel);
      onModelUpdate(updatedModel);
    } catch (e) {
      console.error(e);
      alert("Market analysis failed.");
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  const generateNewPhoto = async () => {
    if (!activeModel) return;
    setIsGeneratingPhoto(true);
    try {
      const latestReference = activeModel.variants[0]?.imageUrl;
      const initialReference = activeModel.variants.length > 0
        ? activeModel.variants[activeModel.variants.length - 1].imageUrl
        : undefined;
      const imageUrl = await generateShowroomCapture(customPrompt, initialReference, latestReference);
      const newVariant = { id: crypto.randomUUID(), prompt: customPrompt, imageUrl, createdAt: Date.now() };
      const updatedModel = {
        ...activeModel,
        variants: [newVariant, ...activeModel.variants]
      };
      setActiveModel(updatedModel);
      onModelUpdate(updatedModel);
      setSelectedVariant(newVariant);
      setCustomPrompt('');
    } catch (e) {
      alert("Capture failed.");
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const loadBrandLore = async () => {
    if (!brand.lore || brand.lore.length === 0) {
      setIsLoadingLore(true);
      try {
        const lore = await generateBrandLore(brand);
        const sortedLore = lore.sort((a, b) => {
          const yearA = parseInt((a.year || '').replace(/\D/g, '')) || 0;
          const yearB = parseInt((b.year || '').replace(/\D/g, '')) || 0;
          return yearA - yearB;
        });
        onBrandUpdate({ ...brand, lore: sortedLore });
      } catch (e) {
        console.error("Failed to load lore", e);
      } finally {
        setIsLoadingLore(false);
      }
    }
  };

  const requestDelete = (model: CarModel) => {
    setPendingDelete(model);
    setDeletePhrase('');
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (deletePhrase.trim().toUpperCase() !== 'DISSOLVE') return;
    onModelDelete(pendingDelete.id);
    setPendingDelete(null);
    setDeletePhrase('');
    if (activeModel?.id === pendingDelete.id) {
      const remaining = models.filter(model => model.id !== pendingDelete.id);
      const next = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      setActiveModel(next);
      setSelectedVariant(next && next.variants.length > 0 ? next.variants[0] : null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setDeletePhrase('');
  };

  const currentReviews = activeModel ? (activeModel.reviews || sessionReviews[activeModel.id]) : undefined;

  return {
    isLaunching,
    isGeneratingPhoto,
    isAnalyzingMarket,
    isLoadingLore,
    customPrompt,
    setCustomPrompt,
    pendingDelete,
    deletePhrase,
    setDeletePhrase,
    currentReviews,
    launchVehicle,
    analyzeMarket,
    generateNewPhoto,
    loadBrandLore,
    requestDelete,
    confirmDelete,
    cancelDelete
  };
};
