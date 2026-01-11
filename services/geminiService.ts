
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Brand, CarModel, CarTier, Review, LoreEntry, CarVariant } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

const cleanJson = (text: string | undefined): string => {
  if (!text) return "[]";
  let clean = text.trim();
  clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim();
  return clean;
};

const ensureArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const values = Object.values(data);
    const arrayPart = values.find(v => Array.isArray(v));
    if (arrayPart) return arrayPart as any[];
  }
  return [];
};

export const generateBrandIdentity = async (keywords: string, tone: string): Promise<Omit<Brand, 'id'>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Create a bespoke luxury car brand identity. Keywords: ${keywords}, Tone: ${tone}. Include heritage, design philosophy, materials, and a lighting signature.`,
    config: {
      responseMimeType: "application/json",
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
        required: ["name", "tagline", "history", "colors", "designPhilosophy"]
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const enrichBrandHistory = async (brand: Brand): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Expand the automotive history of "${brand.name}" into a 3-paragraph saga. Current history: ${brand.history}`,
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });
  return response.text || brand.history;
};

export const generateBrandLore = async (brand: Brand): Promise<LoreEntry[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Generate 4 key historical milestones for the luxury brand "${brand.name}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
  });
  const raw = JSON.parse(cleanJson(response.text));
  return ensureArray(raw).map((l: any) => ({ ...l, id: l.id || crypto.randomUUID() }));
};

export const generateAdditionalLore = async (brand: Brand, existing: string[]): Promise<LoreEntry[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Generate 2 more unique historical records for "${brand.name}". Avoid: ${existing.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
  });
  const raw = JSON.parse(cleanJson(response.text));
  return ensureArray(raw).map((l: any) => ({ ...l, id: l.id || crypto.randomUUID() }));
};

export const generateLoreImage = async (brandName: string, lore: LoreEntry): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: `A high-end, historical automotive photography of ${brandName}: ${lore.title}. ${lore.content}. Vintage style, cinematic, 8k, photorealistic.`,
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const generateCarSpecs = async (brand: Brand, tier: CarTier, requirements: string, existing: CarModel[]): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Engineer a new ${tier} model for ${brand.name}. 
    Requirements: ${requirements}. 
    Existing models: ${existing.map(m => m.name).join(', ')}.
    Include a long, evocative marketing blurb (300+ words) written in a high-end luxury tone.`,
    config: {
      responseMimeType: "application/json",
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
        required: ["name", "tagline", "price", "specs", "marketingBlurb", "visualDescription"]
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateCarImage = async (description: string, context: string, tier: CarTier, masterRef?: string, latestRef?: string): Promise<string> => {
  const ai = getAI();
  const parts: any[] = [];
  if (masterRef) parts.push({ inlineData: { data: masterRef.split(',')[1], mimeType: 'image/png' } });
  parts.push({ text: `Bespoke luxury ${tier} car design. Platform: ${description}. View Context: ${context}. Photorealistic, commercial photography, 8k resolution, cinematic lighting.` });
  
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: { parts },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const generateLaunchReviews = async (brand: Brand, model: CarModel): Promise<Review[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Generate 3 critical media reviews for the launch of the ${brand.name} ${model.name}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            publication: { type: Type.STRING },
            author: { type: Type.STRING },
            score: { type: Type.STRING },
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            persona: { type: Type.STRING, enum: ["PURIST", "FUTURIST", "LIFESTYLE"] }
          }
        }
      }
    }
  });
  const raw = JSON.parse(cleanJson(response.text));
  return ensureArray(raw);
};
