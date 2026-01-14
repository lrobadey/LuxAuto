import { Brand, BrandBrief, CarModel, CarTier, LoreEntry, Review, MarketInsight, ModelProgram } from '../types';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.replace(/\/$/, '') : '';

const buildUrl = (path: string) => {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const postJson = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const generateBrandIdentity = async (
  keywords: string,
  tone: string,
  brief?: BrandBrief
): Promise<Omit<Brand, 'id'>> => {
  return postJson<Omit<Brand, 'id'>>('/api/brand-identity', { keywords, tone, brief });
};

export const enrichBrandHistory = async (brand: Brand): Promise<string> => {
  const { history } = await postJson<{ history: string }>('/api/enrich-brand-history', { brand });
  return history;
};

export const generateBrandLore = async (brand: Brand): Promise<LoreEntry[]> => {
  const { lore } = await postJson<{ lore: LoreEntry[] }>('/api/brand-lore', { brand });
  return lore;
};

export const generateAdditionalLore = async (brand: Brand, existing: string[]): Promise<LoreEntry[]> => {
  const { lore } = await postJson<{ lore: LoreEntry[] }>('/api/brand-lore-more', { brand, existingTitles: existing });
  return lore;
};

export const generateLoreImage = async (brand: Brand, lore: LoreEntry): Promise<string> => {
  const { imageUrl } = await postJson<{ imageUrl: string }>('/api/lore-image', { brand, lore });
  return imageUrl;
};

export const generateCarSpecs = async (
  brand: Brand,
  tier: CarTier,
  requirements: string,
  existing: CarModel[],
  program?: ModelProgram
): Promise<any> => {
  return postJson('/api/car-specs', { brand, tier, requirements, existing, program });
};

export const generateCarImage = async (
  brand: Brand,
  description: string,
  context: string,
  tier: CarTier,
  masterRef?: string,
  latestRef?: string
): Promise<string> => {
  const { imageUrl } = await postJson<{ imageUrl: string }>('/api/car-image', {
    brand,
    description,
    context,
    tier,
    masterRef,
    latestRef
  });
  return imageUrl;
};

export const generateShowroomCapture = async (
  context: string,
  masterRef?: string,
  latestRef?: string
): Promise<string> => {
  const { imageUrl } = await postJson<{ imageUrl: string }>('/api/showroom-capture', {
    context,
    masterRef,
    latestRef
  });
  return imageUrl;
};

export const generateLaunchReviews = async (brand: Brand, model: CarModel): Promise<Review[]> => {
  const { reviews } = await postJson<{ reviews: Review[] }>('/api/launch-reviews', { brand, model });
  return reviews;
};

export const generateMarketInsight = async (brand: Brand, model: CarModel): Promise<MarketInsight> => {
  const { insight } = await postJson<{ insight: MarketInsight }>('/api/market-insight', { brand, model });
  return insight;
};
