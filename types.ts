
export enum ViewState {
  WELCOME = 'WELCOME',
  BRAND_CREATION = 'BRAND_CREATION',
  BRAND_HUB = 'BRAND_HUB',
  MODEL_STUDIO = 'MODEL_STUDIO',
  SHOWROOM = 'SHOWROOM'
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  year: string;
  imageUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  history: string;
  designPhilosophy: string;
  colors: string[];
  logoStyle: string;
  // Design Modules
  materials?: string;
  lightingSignature?: string;
  aerodynamics?: string;
  // Heritage
  establishedYear?: string;
  headquarters?: string;
  lore?: LoreEntry[];
  brief?: BrandBrief;
}

export enum CarTier {
  ENTRY_LUXURY = 'Entry Luxury',
  MID_SIZE_LUXURY = 'Mid-Size Luxury',
  FLAGSHIP = 'Flagship',
  SUV_ESTATE = 'SUV / Estate',
  HYPERCAR = 'Hypercar'
}

export interface CarVariant {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: number;
}

export interface BrandBrief {
  archetype: string;
  clientProfile: string;
  performanceEthos: string;
  materialEthos: string;
  lightingEthos: string;
  aeroEthos: string;
}

export interface ModelProgram {
  segment: string;
  bodyStyle: string;
  targetBuyer: string;
  priceBand: string;
  performanceGoal: string;
  powertrainStrategy: string;
  designSignature: string;
}

export interface CarSpecs {
  engine: string;
  horsepower: string;
  torque: string;
  acceleration: string;
  topSpeed: string;
  weight: string;
  drivetrain: string;
  dimensions: string;
  transmission: string;
  dragCoefficient: string;
  suspension: string;
  brakes: string;
  // New detailed specs
  wheelDesign: string;
  interiorMaterials: string;
  soundSystem: string;
  chassisConstruction: string;
  driverAssistance: string;
}

export interface Review {
  publication: string;
  author: string;
  score: string;
  headline: string;
  summary: string;
  persona: 'PURIST' | 'FUTURIST' | 'LIFESTYLE';
}

export interface MarketInsight {
  collectorScore: number; // 0-100
  resaleValue: string; // e.g. "High Appreciation", "Stable", "Depreciating"
  targetDemographic: string; // Description of who buys this
  marketSentiment: string; // A brief analysis paragraph
}

export interface CarModel {
  id: string;
  brandId: string;
  name: string;
  tagline: string;
  tier: CarTier;
  price: string;
  specs: CarSpecs;
  visualDescription: string;
  marketingBlurb: string; // Long marketing-focused description
  variants: CarVariant[];
  program?: ModelProgram;
  heroVariantId?: string;
  reviews?: Review[];
  marketInsight?: MarketInsight;
  isGenerating?: boolean;
}
