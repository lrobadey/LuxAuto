import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { TIER_CONSTRAINTS } from '../constants.js';
import { normalizeSpecs } from '../services/specNormalizers.js';

const TEXT_MODEL = 'gemini-3-flash-preview';
const REASONING_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY.');
  }
  return new GoogleGenAI({ apiKey });
};

const cleanJson = (text: string | undefined): string => {
  if (!text) return '[]';
  let clean = text.trim();
  clean = clean.replace(/```json/gi, '').replace(/```/g, '').trim();
  return clean;
};

const ensureArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const values = Object.values(data);
    const arrayPart = values.find((value) => Array.isArray(value));
    if (arrayPart) return arrayPart as any[];
  }
  return [];
};

const safeJsonParse = <T>(text: string | undefined, fallback: T): T => {
  try {
    return JSON.parse(cleanJson(text)) as T;
  } catch {
    return fallback;
  }
};

const normalizeBrandIdentity = (raw: any) => ({
  name: typeof raw?.name === 'string' ? raw.name : 'Untitled Legacy',
  tagline: typeof raw?.tagline === 'string' ? raw.tagline : '',
  history: typeof raw?.history === 'string' ? raw.history : '',
  establishedYear: typeof raw?.establishedYear === 'string' ? raw.establishedYear : '',
  headquarters: typeof raw?.headquarters === 'string' ? raw.headquarters : '',
  designPhilosophy: typeof raw?.designPhilosophy === 'string' ? raw.designPhilosophy : '',
  colors: Array.isArray(raw?.colors) ? raw.colors.filter((c: unknown) => typeof c === 'string') : [],
  logoStyle: typeof raw?.logoStyle === 'string' ? raw.logoStyle : '',
  materials: typeof raw?.materials === 'string' ? raw.materials : '',
  lightingSignature: typeof raw?.lightingSignature === 'string' ? raw.lightingSignature : '',
  aerodynamics: typeof raw?.aerodynamics === 'string' ? raw.aerodynamics : ''
});

const normalizeCarSpecsPayload = (raw: any) => ({
  name: typeof raw?.name === 'string' ? raw.name : 'Untitled Model',
  tagline: typeof raw?.tagline === 'string' ? raw.tagline : '',
  price: typeof raw?.price === 'string' ? raw.price : '',
  visualDescription: typeof raw?.visualDescription === 'string' ? raw.visualDescription : '',
  marketingBlurb: typeof raw?.marketingBlurb === 'string' ? raw.marketingBlurb : '',
  specs: normalizeSpecs(raw?.specs)
});

const normalizeLoreEntries = (raw: any) =>
  ensureArray(raw).map((entry: any) => ({
    id: typeof entry?.id === 'string' ? entry.id : crypto.randomUUID(),
    title: typeof entry?.title === 'string' ? entry.title : '',
    content: typeof entry?.content === 'string' ? entry.content : '',
    year: typeof entry?.year === 'string' ? entry.year : ''
  }));

const formatBrandBrief = (brief?: any): string => {
  if (!brief) return '';
  const parts = [
    brief.archetype ? `Archetype: ${brief.archetype}` : '',
    brief.clientProfile ? `Client Profile: ${brief.clientProfile}` : '',
    brief.performanceEthos ? `Performance Ethos: ${brief.performanceEthos}` : '',
    brief.materialEthos ? `Material Ethos: ${brief.materialEthos}` : '',
    brief.lightingEthos ? `Lighting Ethos: ${brief.lightingEthos}` : '',
    brief.aeroEthos ? `Aero Ethos: ${brief.aeroEthos}` : ''
  ].filter(Boolean);
  return parts.join('\n');
};

const formatProgramBrief = (program?: any): string => {
  if (!program) return '';
  const parts = [
    program.segment ? `Segment: ${program.segment}` : '',
    program.bodyStyle ? `Body Style: ${program.bodyStyle}` : '',
    program.targetBuyer ? `Target Buyer: ${program.targetBuyer}` : '',
    program.priceBand ? `Price Band: ${program.priceBand}` : '',
    program.performanceGoal ? `Performance Goal: ${program.performanceGoal}` : '',
    program.powertrainStrategy ? `Powertrain Strategy: ${program.powertrainStrategy}` : '',
    program.designSignature ? `Design Signature: ${program.designSignature}` : ''
  ].filter(Boolean);
  return parts.join('\n');
};

const formatTierTargets = (tier: any): string => {
  const target = TIER_CONSTRAINTS[tier];
  if (!target) return '';
  return [
    `Tier Targets (${tier}):`,
    `Price Band: ${target.priceBand}`,
    `Segment: ${target.segment}`,
    `Body Style: ${target.bodyStyle}`,
    `Performance: ${target.performanceGoal}`,
    `Powertrain: ${target.powertrainStrategy}`,
    `Design Signature: ${target.designSignature}`,
    `Notes: ${target.notes}`
  ].join('\n');
};

const formatBrandContext = (brand: any, options?: { historyLimit?: number }): string => {
  const historyLimit = options?.historyLimit;
  const history = brand?.history || '';
  const historyText = historyLimit && history.length > historyLimit
    ? `${history.slice(0, historyLimit)}...`
    : history;
  const lines = [
    `Brand: ${brand?.name || ''}`,
    brand?.tagline ? `Tagline: ${brand.tagline}` : '',
    brand?.establishedYear ? `Established: ${brand.establishedYear}` : '',
    brand?.headquarters ? `Headquarters: ${brand.headquarters}` : '',
    historyText ? `History: ${historyText}` : '',
    brand?.designPhilosophy ? `Design Philosophy: ${brand.designPhilosophy}` : '',
    brand?.materials ? `Materials: ${brand.materials}` : '',
    brand?.lightingSignature ? `Lighting Signature: ${brand.lightingSignature}` : '',
    brand?.aerodynamics ? `Aerodynamics: ${brand.aerodynamics}` : '',
    brand?.logoStyle ? `Logo Style: ${brand.logoStyle}` : '',
    brand?.colors?.length ? `Colors: ${brand.colors.join(', ')}` : ''
  ].filter(Boolean);
  return lines.join('\n');
};

const formatVisualContext = (brand: any): string => {
  const parts = [
    brand?.designPhilosophy ? `Design language: ${brand.designPhilosophy}` : '',
    brand?.materials ? `Materials: ${brand.materials}` : '',
    brand?.lightingSignature ? `Lighting signature: ${brand.lightingSignature}` : '',
    brand?.logoStyle ? `Logo style: ${brand.logoStyle}` : '',
    brand?.colors?.length ? `Palette: ${brand.colors.join(', ')}` : ''
  ].filter(Boolean);
  return parts.join(' ');
};

const extractDataUrlPayload = (value: string | undefined) => {
  if (!value || typeof value !== 'string') return null;
  const [prefix, data] = value.split(',', 2);
  if (!prefix || !data) return null;
  if (!prefix.includes('data:image')) return null;
  return data;
};

export const createBrandIdentity = async (keywords: string, tone: string, brief?: any) => {
  const ai = getAI();
  const briefContext = formatBrandBrief(brief);
  const response = await ai.models.generateContent({
    model: REASONING_MODEL,
    contents: `Create a bespoke luxury car brand identity. 
    Keywords: ${keywords}. 
    Tone/Vibe: ${tone}. 
    ${briefContext ? `Brand Brief:\n${briefContext}` : ''}
    
    CRITICAL INSTRUCTION: Perform deep creative reasoning to synthesize these keywords into a cohesive, world-class luxury narrative. 
    The brand should feel historically grounded yet forward-thinking. 
    Include detailed heritage, a robust design philosophy, specific materials, and a unique lighting signature.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tagline: { type: Type.STRING },
          history: { type: Type.STRING },
          establishedYear: { type: Type.STRING },
          headquarters: { type: Type.STRING },
          designPhilosophy: { type: Type.STRING },
          colors: { type: Type.ARRAY, items: { type: Type.STRING } },
          logoStyle: { type: Type.STRING },
          materials: { type: Type.STRING },
          lightingSignature: { type: Type.STRING },
          aerodynamics: { type: Type.STRING }
        },
        required: ['name', 'tagline', 'history', 'colors', 'designPhilosophy']
      }
    }
  });
  const raw = safeJsonParse<any>(response.text, {});
  return normalizeBrandIdentity(raw);
};

export const expandBrandHistory = async (brand: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: REASONING_MODEL,
    contents: `Expand the automotive history of "${brand.name}" into a 3-paragraph saga. Current history: ${brand.history}. Focus on the brand's evolution, engineering breakthroughs, and cultural impact.`,
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } }
  });
  return response.text || brand.history || '';
};

export const createBrandLore = async (brand: any) => {
  const ai = getAI();
  const brandContext = formatBrandContext(brand);
  const response = await ai.models.generateContent({
    model: REASONING_MODEL,
    contents: `Generate 4 key historical milestones for the luxury brand "${brand.name}".
    Brand Context:
    ${brandContext}
    
    Ensure each milestone reinforces the brand's design philosophy, material identity, and lighting signature.
    Return a JSON object with a "milestones" property containing the array.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  const raw = safeJsonParse<any>(response.text, {});
  return normalizeLoreEntries(raw);
};

export const createAdditionalLore = async (brand: any, existing: string[]) => {
  const ai = getAI();
  const brandContext = formatBrandContext(brand);
  const response = await ai.models.generateContent({
    model: REASONING_MODEL,
    contents: `Generate 2 more unique historical records for "${brand.name}". Avoid these titles: ${existing.join(', ')}.
    Brand Context:
    ${brandContext}
    
    Ensure each new record aligns with the brand's heritage and visual philosophy.
    Return a JSON object with a "milestones" property.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  const raw = safeJsonParse<any>(response.text, {});
  return normalizeLoreEntries(raw);
};

export const createLoreImage = async (brand: any, lore: any) => {
  const ai = getAI();
  const visualContext = formatVisualContext(brand);
  const visualLine = visualContext ? `Brand visual DNA: ${visualContext}.` : '';
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: `A high-end, historical automotive photography of ${brand.name}: ${lore.title}. ${lore.content}. ${visualLine} Vintage style, cinematic, 8k, photorealistic.`
  });
  const part = response.candidates?.[0]?.content?.parts.find((p) => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const createCarSpecs = async (
  brand: any,
  tier: any,
  requirements: string,
  existing: any[],
  program?: any
) => {
  const ai = getAI();
  const brandContext = formatBrandContext(brand);
  const brandBrief = formatBrandBrief(brand.brief);
  const programBrief = formatProgramBrief(program);
  const tierTargets = formatTierTargets(tier);
  const response = await ai.models.generateContent({
    model: REASONING_MODEL,
    contents: `Engineer a new ${tier} model for the luxury brand "${brand.name}". 
    
    BRAND CONTEXT:
    ${brandContext}
    ${brandBrief ? `\nBRAND BRIEF:\n${brandBrief}` : ''}
    
    PROGRAM BRIEF:
    ${programBrief || 'No additional program brief provided.'}

    TIER TARGETS:
    ${tierTargets}

    ENGINEERING BRIEF: ${requirements}. 
    EXISTING FLEET: ${existing.map((model) => model.name).join(', ')}.

    OVERRIDE RULE: If the program brief conflicts with tier targets, follow the user's program brief first.
    
    CRITICAL INSTRUCTION: Perform deep engineering reasoning. Ensure the technical specifications (horsepower, torque, weight, drag coefficient) are logically consistent with the resulting performance figures (0-60mph, top speed) and aligned with the brand's DNA.
    
    Include a long, evocative marketing blurb (300+ words) written in a high-end luxury tone that references the brand's philosophy.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tagline: { type: Type.STRING },
          price: { type: Type.STRING },
          visualDescription: { type: Type.STRING },
          marketingBlurb: { type: Type.STRING },
          specs: {
            type: Type.OBJECT,
            properties: {
              engine: { type: Type.STRING },
              horsepower: { type: Type.STRING },
              torque: { type: Type.STRING },
              acceleration: { type: Type.STRING },
              topSpeed: { type: Type.STRING },
              weight: { type: Type.STRING },
              drivetrain: { type: Type.STRING },
              dimensions: { type: Type.STRING },
              transmission: { type: Type.STRING },
              dragCoefficient: { type: Type.STRING },
              suspension: { type: Type.STRING },
              brakes: { type: Type.STRING },
              wheelDesign: { type: Type.STRING },
              interiorMaterials: { type: Type.STRING },
              soundSystem: { type: Type.STRING },
              chassisConstruction: { type: Type.STRING },
              driverAssistance: { type: Type.STRING }
            }
          }
        },
        required: ['name', 'tagline', 'price', 'specs', 'marketingBlurb', 'visualDescription']
      }
    }
  });
  const raw = safeJsonParse<any>(response.text, {});
  return normalizeCarSpecsPayload(raw);
};

export const createCarImage = async (
  brand: any,
  description: string,
  context: string,
  tier: any,
  masterRef?: string,
  latestRef?: string
) => {
  const ai = getAI();
  const parts: any[] = [];
  const visualContext = formatVisualContext(brand);
  const visualLine = visualContext ? `Brand Visual DNA: ${visualContext}.` : '';
  const masterData = extractDataUrlPayload(masterRef);
  const latestData = extractDataUrlPayload(latestRef);
  if (masterData) parts.push({ inlineData: { data: masterData, mimeType: 'image/png' } });
  if (latestData) parts.push({ inlineData: { data: latestData, mimeType: 'image/png' } });
  const referenceNote = masterData || latestData
    ? 'Use the first image as the master reference for proportions and brand DNA. Use the second image to retain the latest styling updates. Preserve overall silhouette unless the blueprint explicitly changes it.'
    : '';
  const deltaNote = 'Apply only the described changes; keep all other design features unchanged.';
  const prompt = `Bespoke luxury ${tier} car design for ${brand.name}. 
  Brand Philosophy: ${brand.designPhilosophy}. 
  Visual Cues: ${brand.lightingSignature || ''}, ${brand.materials || ''}.
  ${visualLine}
  ${referenceNote}
  ${deltaNote}
  Model Blueprint: ${description}. 
  Environment/Context: ${context}. 
  Style: Photorealistic, high-end commercial automotive photography, 8k resolution, cinematic lighting.`;
  parts.push({ text: prompt });
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: { parts }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p) => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const createShowroomCapture = async (context: string, masterRef?: string, latestRef?: string) => {
  const ai = getAI();
  const parts: any[] = [];
  const masterData = extractDataUrlPayload(masterRef);
  const latestData = extractDataUrlPayload(latestRef);
  if (masterData) parts.push({ inlineData: { data: masterData, mimeType: 'image/png' } });
  if (latestData) parts.push({ inlineData: { data: latestData, mimeType: 'image/png' } });
  const referenceNote = masterData || latestData
    ? 'Use the first image as the master reference for proportions and brand DNA. Use the second image to retain the latest styling updates. Preserve overall silhouette unless the context explicitly changes it.'
    : '';
  const prompt = [
    referenceNote,
    context ? `Environment/Context: ${context}.` : ''
  ].filter(Boolean).join(' ');
  const finalPrompt = prompt || 'Showroom capture.';
  parts.push({ text: finalPrompt });
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: { parts }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p) => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const createLaunchReviews = async (brand: any, model: any) => {
  const ai = getAI();
  const brandContext = formatBrandContext(brand, { historyLimit: 700 });
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Generate 3 critical media reviews for the launch of the ${brand.name} ${model.name}.
    Brand Context:
    ${brandContext}
    Vehicle Positioning: ${model.marketingBlurb.substring(0, 400)}...
    
    The reviews should feel authentic to the brand's position in the luxury market.
    Return a JSON object with a "reviews" property.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reviews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                publication: { type: Type.STRING },
                author: { type: Type.STRING },
                score: { type: Type.STRING },
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                persona: { type: Type.STRING, enum: ['PURIST', 'FUTURIST', 'LIFESTYLE'] }
              }
            }
          }
        }
      }
    }
  });
  const raw = safeJsonParse<any>(response.text, {});
  return ensureArray(raw);
};

export const createMarketInsight = async (brand: any, model: any) => {
  const ai = getAI();
  const brandContext = formatBrandContext(brand, { historyLimit: 700 });
  const response = await ai.models.generateContent({
    model: REASONING_MODEL,
    contents: `Analyze the high-end automotive market potential for the ${brand.name} ${model.name}.
    Brand Context:
    ${brandContext}
    Price: ${model.price}
    Tier: ${model.tier}
    Specs: ${JSON.stringify(model.specs)}
    
    Determine:
    1. Collector Score (0-100) based on rarity, engineering, and brand prestige.
    2. Resale Value projection (e.g., "High Appreciation (+15%/yr)", "Stable Hold", "Depreciating Asset", "Future Classic").
    3. Target Demographic (specific buyer persona, e.g., "Silicon Valley Magnate", "Old World Royalty", "Track Day Purist").
    4. Market Sentiment (A sophisticated investment memorandum paragraph).
    
    Return JSON.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          collectorScore: { type: Type.NUMBER },
          resaleValue: { type: Type.STRING },
          targetDemographic: { type: Type.STRING },
          marketSentiment: { type: Type.STRING }
        }
      }
    }
  });
  const raw = safeJsonParse<any>(response.text, {});
  return {
    collectorScore: typeof raw.collectorScore === 'number' ? raw.collectorScore : 0,
    resaleValue: typeof raw.resaleValue === 'string' ? raw.resaleValue : '',
    targetDemographic: typeof raw.targetDemographic === 'string' ? raw.targetDemographic : '',
    marketSentiment: typeof raw.marketSentiment === 'string' ? raw.marketSentiment : ''
  };
};
