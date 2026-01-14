import { useCallback, useEffect, useState } from 'react';
import { Brand, CarModel } from '../types';
import {
  SaveSlot,
  bulkUpsertSlots,
  dedupeSlots,
  deleteSlot,
  getAllSlots,
  isIdbSupported,
  loadLegacySlots,
  parseArchiveText,
  saveLegacySlots,
  upsertSlot
} from './archiveStore';

type NoticeTone = 'success' | 'warning' | 'error';
type StorageMode = 'idb' | 'local';

const mergeSlots = (current: SaveSlot[], incoming: SaveSlot[]) =>
  dedupeSlots([...current, ...incoming]).sort((a, b) => b.timestamp - a.timestamp);

export const useArchiveVault = () => {
  const [savedBrands, setSavedBrands] = useState<SaveSlot[]>([]);
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>('idb');

  const refreshSaves = useCallback(async () => {
    const legacy = (() => {
      try {
        return loadLegacySlots();
      } catch (error) {
        console.error("Failed to read legacy archives", error);
        return { slots: [], dropped: 0, source: 'empty' as const };
      }
    })();

    try {
      const idbSlots = await getAllSlots();
      if (idbSlots.length > 0) {
        setSavedBrands(idbSlots);
        setStorageMode('idb');
        return;
      }

      if (legacy.slots.length > 0) {
        await bulkUpsertSlots(legacy.slots);
        setSavedBrands(legacy.slots);
        setStorageMode('idb');
        if (legacy.dropped > 0) {
          setNotice({ tone: 'warning', message: `Legacy archives migrated. ${legacy.dropped} corrupted entries removed.` });
        } else {
          setNotice({ tone: 'success', message: 'Legacy archives migrated to the new vault.' });
        }
        return;
      }

      setSavedBrands([]);
      setStorageMode('idb');
    } catch (e) {
      console.error("Failed to load archives", e);
      if (legacy.slots.length > 0) {
        setSavedBrands(legacy.slots);
        setStorageMode('local');
        if (legacy.dropped > 0) {
          setNotice({ tone: 'warning', message: `IndexedDB unavailable. Using legacy storage with ${legacy.dropped} corrupted entries removed.` });
        } else {
          setNotice({ tone: 'warning', message: 'IndexedDB unavailable. Using legacy storage; large image archives may be limited.' });
        }
      } else {
        setSavedBrands([]);
        setStorageMode(isIdbSupported() ? 'idb' : 'local');
        setNotice({ tone: 'error', message: 'Archive storage unavailable. Your data cannot be saved.' });
      }
    }
  }, []);

  useEffect(() => {
    void refreshSaves();
  }, [refreshSaves]);

  const saveCurrent = useCallback(async (brand: Brand, models: CarModel[]) => {
    const newSave: SaveSlot = {
      id: brand.id,
      name: brand.name,
      timestamp: Date.now(),
      brand: brand,
      models: models
    };
    const nextSaves = mergeSlots(savedBrands.filter(s => s.id !== brand.id), [newSave]);

    if (storageMode === 'idb') {
      try {
        await upsertSlot(newSave);
        setSavedBrands(nextSaves);
        setNotice({ tone: 'success', message: 'Legacy secured in archive.' });
        return;
      } catch (error) {
        console.error("IndexedDB save failed", error);
        try {
          saveLegacySlots(nextSaves);
          setSavedBrands(nextSaves);
          setStorageMode('local');
          setNotice({ tone: 'warning', message: 'IndexedDB unavailable. Saved to legacy storage; large images may be limited.' });
          return;
        } catch (fallbackError) {
          console.error("Legacy save failed", fallbackError);
        }
        setNotice({ tone: 'error', message: 'Archive save failed. Storage unavailable.' });
        return;
      }
    }

    try {
      saveLegacySlots(nextSaves);
      setSavedBrands(nextSaves);
      setNotice({ tone: 'success', message: 'Legacy secured in archive.' });
    } catch (quotaError) {
      console.warn("Legacy storage full, stripping images");
      const minimalBrand = {
        ...brand,
        lore: brand.lore?.map(l => ({ ...l, imageUrl: undefined }))
      };
      const minimalModels = models.map(m => ({
        ...m,
        variants: m.variants.map(v => ({ ...v, imageUrl: '' }))
      }));
      const minimalSave = { ...newSave, brand: minimalBrand, models: minimalModels };
      const fallbackSaves = mergeSlots(savedBrands.filter(s => s.id !== brand.id), [minimalSave]);
      try {
        saveLegacySlots(fallbackSaves);
        setSavedBrands(fallbackSaves);
        setNotice({ tone: 'warning', message: 'Legacy archived without visuals due to browser storage limits.' });
      } catch (fallbackError) {
        console.error("Legacy save failed", fallbackError);
        setNotice({ tone: 'error', message: 'Archive failed. Local storage may be unavailable.' });
      }
    }
  }, [savedBrands, storageMode]);

  const deleteSave = useCallback(async (id: string) => {
    const newSaves = savedBrands.filter(s => s.id !== id);
    try {
      if (storageMode === 'idb') {
        await deleteSlot(id);
      } else {
        saveLegacySlots(newSaves);
      }
      setSavedBrands(newSaves);
      setNotice({ tone: 'success', message: 'Legacy dissolved.' });
    } catch (e) {
      setNotice({ tone: 'error', message: 'Unable to update archives. Storage may be locked.' });
    }
  }, [savedBrands, storageMode]);

  const exportArchives = useCallback(async () => {
    try {
      const slots = storageMode === 'idb' ? await getAllSlots() : savedBrands;
      if (slots.length === 0) {
        setNotice({ tone: 'warning', message: 'No archives to export yet.' });
        return;
      }
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        slots
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `luxeauto-archives-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice({ tone: 'success', message: 'Archives exported.' });
    } catch (error) {
      console.error("Export failed", error);
      setNotice({ tone: 'error', message: 'Export failed. Try again.' });
    }
  }, [savedBrands, storageMode]);

  const importArchives = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseArchiveText(text);
      if (parsed.slots.length === 0) {
        setNotice({ tone: 'error', message: 'Import failed. No valid archives found.' });
        return;
      }
      const existingIds = new Set(savedBrands.map(slot => slot.id));
      const replaced = parsed.slots.filter(slot => existingIds.has(slot.id)).length;

      if (storageMode === 'idb') {
        await bulkUpsertSlots(parsed.slots);
        const refreshed = await getAllSlots();
        setSavedBrands(refreshed);
      } else {
        const merged = mergeSlots(savedBrands, parsed.slots);
        saveLegacySlots(merged);
        setSavedBrands(merged);
      }

      const dropped = parsed.dropped > 0 ? ` ${parsed.dropped} invalid entries dropped.` : '';
      const replacedText = replaced > 0 ? ` ${replaced} replaced.` : '';
      setNotice({ tone: 'success', message: `Imported ${parsed.slots.length} archives.${replacedText}${dropped}`.trim() });
    } catch (error) {
      console.error("Import failed", error);
      setNotice({ tone: 'error', message: 'Import failed. File is not valid JSON.' });
    }
  }, [savedBrands, storageMode]);

  return {
    savedBrands,
    notice,
    setNotice,
    storageMode,
    refreshSaves,
    saveCurrent,
    deleteSave,
    exportArchives,
    importArchives
  };
};
