import { Brand, BrandBrief, CarModel, CarTier, CarVariant, LoreEntry, ModelProgram } from "../types";
import { normalizeSpecs } from "./specNormalizers";

const STORAGE_KEY_V1 = "luxeauto_saves_v1";
const STORAGE_KEY_V2 = "luxeauto_saves_v2";
const STORAGE_VERSION = 2;
const DB_NAME = "luxeauto_archive";
const DB_VERSION = 1;
const STORE_NAME = "saves";

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  brand: Brand;
  models: CarModel[];
}

interface SaveStoreV2 {
  version: number;
  updatedAt: number;
  slots: SaveSlot[];
}

export const isIdbSupported = () => typeof indexedDB !== "undefined";

const safeParse = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeVariant = (raw: any): CarVariant | null => {
  if (!raw || typeof raw !== "object") return null;
  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : "";
  return {
    id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
    prompt: typeof raw.prompt === "string" ? raw.prompt : "",
    imageUrl,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now()
  };
};

const normalizeLoreEntry = (raw: any): LoreEntry | null => {
  if (!raw || typeof raw !== "object") return null;
  const title = typeof raw.title === "string" ? raw.title : "";
  const content = typeof raw.content === "string" ? raw.content : "";
  const year = typeof raw.year === "string" ? raw.year : "";
  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : undefined;
  if (!title && !content && !year) return null;
  return {
    id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
    title,
    content,
    year,
    imageUrl
  };
};

const normalizeBrandBrief = (raw: any): BrandBrief | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    archetype: typeof raw.archetype === "string" ? raw.archetype : "",
    clientProfile: typeof raw.clientProfile === "string" ? raw.clientProfile : "",
    performanceEthos: typeof raw.performanceEthos === "string" ? raw.performanceEthos : "",
    materialEthos: typeof raw.materialEthos === "string" ? raw.materialEthos : "",
    lightingEthos: typeof raw.lightingEthos === "string" ? raw.lightingEthos : "",
    aeroEthos: typeof raw.aeroEthos === "string" ? raw.aeroEthos : ""
  };
};

const normalizeModelProgram = (raw: any): ModelProgram | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    segment: typeof raw.segment === "string" ? raw.segment : "",
    bodyStyle: typeof raw.bodyStyle === "string" ? raw.bodyStyle : "",
    targetBuyer: typeof raw.targetBuyer === "string" ? raw.targetBuyer : "",
    priceBand: typeof raw.priceBand === "string" ? raw.priceBand : "",
    performanceGoal: typeof raw.performanceGoal === "string" ? raw.performanceGoal : "",
    powertrainStrategy: typeof raw.powertrainStrategy === "string" ? raw.powertrainStrategy : "",
    designSignature: typeof raw.designSignature === "string" ? raw.designSignature : ""
  };
};

const normalizeModel = (raw: any, brandId: string): CarModel | null => {
  if (!raw || typeof raw !== "object") return null;
  const name = typeof raw.name === "string" ? raw.name : "Untitled Model";
  const tagline = typeof raw.tagline === "string" ? raw.tagline : "";
  const price = typeof raw.price === "string" ? raw.price : "";
  const visualDescription = typeof raw.visualDescription === "string" ? raw.visualDescription : "";
  const marketingBlurb = typeof raw.marketingBlurb === "string" ? raw.marketingBlurb : "";
  const tierValues = Object.values(CarTier);
  const tier = tierValues.includes(raw.tier) ? raw.tier : CarTier.FLAGSHIP;
  const id = typeof raw.id === "string" ? raw.id : crypto.randomUUID();
  const variants = Array.isArray(raw.variants)
    ? raw.variants.map(normalizeVariant).filter(Boolean)
    : [];
  const heroVariantIdRaw = typeof raw.heroVariantId === "string" ? raw.heroVariantId : undefined;
  const heroVariantId =
    heroVariantIdRaw && variants.some(v => v.id === heroVariantIdRaw) ? heroVariantIdRaw : undefined;
  return {
    ...raw,
    id,
    brandId: typeof raw.brandId === "string" ? raw.brandId : brandId,
    name,
    tagline,
    price,
    tier,
    visualDescription,
    marketingBlurb,
    specs: normalizeSpecs(raw.specs),
    variants,
    program: normalizeModelProgram(raw.program),
    heroVariantId
  } as CarModel;
};

const normalizeBrand = (raw: any, id: string): Brand => {
  const colors = Array.isArray(raw.colors)
    ? raw.colors.filter((color: unknown) => typeof color === "string")
    : [];
  const lore = Array.isArray(raw.lore)
    ? raw.lore.map(normalizeLoreEntry).filter(Boolean)
    : undefined;
  return {
    id,
    name: typeof raw.name === "string" ? raw.name : "Untitled Legacy",
    tagline: typeof raw.tagline === "string" ? raw.tagline : "",
    history: typeof raw.history === "string" ? raw.history : "",
    designPhilosophy: typeof raw.designPhilosophy === "string" ? raw.designPhilosophy : "",
    colors,
    logoStyle: typeof raw.logoStyle === "string" ? raw.logoStyle : "",
    materials: typeof raw.materials === "string" ? raw.materials : undefined,
    lightingSignature: typeof raw.lightingSignature === "string" ? raw.lightingSignature : undefined,
    aerodynamics: typeof raw.aerodynamics === "string" ? raw.aerodynamics : undefined,
    establishedYear: typeof raw.establishedYear === "string" ? raw.establishedYear : undefined,
    headquarters: typeof raw.headquarters === "string" ? raw.headquarters : undefined,
    lore: lore && lore.length > 0 ? lore : undefined,
    brief: normalizeBrandBrief(raw.brief)
  };
};

const normalizeSaveSlot = (raw: any): SaveSlot | null => {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.brand || typeof raw.brand !== "object") return null;
  const id =
    typeof raw.id === "string"
      ? raw.id
      : typeof raw.brand.id === "string"
        ? raw.brand.id
        : crypto.randomUUID();
  const brand = normalizeBrand(raw.brand, id);
  const name =
    typeof raw.name === "string"
      ? raw.name
      : typeof brand.name === "string"
        ? brand.name
        : "Untitled Legacy";
  const timestamp = typeof raw.timestamp === "number" ? raw.timestamp : Date.now();
  const modelsRaw = Array.isArray(raw.models) ? raw.models : [];
  const models = modelsRaw
    .map((model: any) => normalizeModel(model, id))
    .filter(Boolean) as CarModel[];
  return { id, name, timestamp, brand, models };
};

const normalizeSlots = (rawSlots: any[]) => {
  const slots: SaveSlot[] = [];
  let dropped = 0;
  for (const raw of rawSlots) {
    const normalized = normalizeSaveSlot(raw);
    if (normalized) slots.push(normalized);
    else dropped += 1;
  }
  return { slots, dropped };
};

export const dedupeSlots = (slots: SaveSlot[]) => {
  const map = new Map<string, SaveSlot>();
  for (const slot of slots) {
    const existing = map.get(slot.id);
    if (!existing || slot.timestamp > existing.timestamp) {
      map.set(slot.id, slot);
    }
  }
  return Array.from(map.values());
};

export const loadLegacySlots = () => {
  const v2Raw = safeParse(localStorage.getItem(STORAGE_KEY_V2));
  if (v2Raw && Array.isArray(v2Raw.slots)) {
    const normalized = normalizeSlots(v2Raw.slots);
    return { slots: normalized.slots, dropped: normalized.dropped, source: "v2" as const };
  }

  const v1Raw = safeParse(localStorage.getItem(STORAGE_KEY_V1));
  if (Array.isArray(v1Raw)) {
    const normalized = normalizeSlots(v1Raw);
    return { slots: normalized.slots, dropped: normalized.dropped, source: "v1" as const };
  }

  return { slots: [], dropped: 0, source: "empty" as const };
};

export const saveLegacySlots = (slots: SaveSlot[]) => {
  const payload: SaveStoreV2 = {
    version: STORAGE_VERSION,
    updatedAt: Date.now(),
    slots
  };
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(payload));
};

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open archive database."));
  });

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const waitForTransaction = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

export const getAllSlots = async (): Promise<SaveSlot[]> => {
  if (!isIdbSupported()) {
    throw new Error("IndexedDB unavailable");
  }
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const result = await requestToPromise(store.getAll());
    await waitForTransaction(tx);
    const normalized = normalizeSlots(Array.isArray(result) ? result : []);
    return normalized.slots.sort((a, b) => b.timestamp - a.timestamp);
  } finally {
    db.close();
  }
};

export const upsertSlot = async (slot: SaveSlot) => {
  if (!isIdbSupported()) {
    throw new Error("IndexedDB unavailable");
  }
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(slot);
    await waitForTransaction(tx);
  } finally {
    db.close();
  }
};

export const bulkUpsertSlots = async (slots: SaveSlot[]) => {
  if (!isIdbSupported()) {
    throw new Error("IndexedDB unavailable");
  }
  if (slots.length === 0) return;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    slots.forEach(slot => store.put(slot));
    await waitForTransaction(tx);
  } finally {
    db.close();
  }
};

export const deleteSlot = async (id: string) => {
  if (!isIdbSupported()) {
    throw new Error("IndexedDB unavailable");
  }
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    await waitForTransaction(tx);
  } finally {
    db.close();
  }
};

export const parseArchiveText = (text: string) => {
  const raw = safeParse(text);
  if (!raw) return { slots: [], dropped: 0 };
  const rawSlots = Array.isArray(raw) ? raw : Array.isArray(raw.slots) ? raw.slots : [];
  const normalized = normalizeSlots(rawSlots);
  return { slots: dedupeSlots(normalized.slots), dropped: normalized.dropped };
};
