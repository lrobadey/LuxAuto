import { CarTier } from "./types.js";

export const DEFAULT_TIERS = [
  CarTier.ENTRY_LUXURY,
  CarTier.MID_SIZE_LUXURY,
  CarTier.SUV_ESTATE,
  CarTier.FLAGSHIP,
  CarTier.HYPERCAR
];

export interface TierConstraint {
  priceBand: string;
  segment: string;
  bodyStyle: string;
  performanceGoal: string;
  powertrainStrategy: string;
  designSignature: string;
  notes: string;
}

export const TIER_CONSTRAINTS: Record<CarTier, TierConstraint> = {
  [CarTier.ENTRY_LUXURY]: {
    priceBand: "$45k-$80k",
    segment: "Entry luxury compact/midsize",
    bodyStyle: "4-door sedan or compact crossover",
    performanceGoal: "0-60 mph in 5-7s, 130-160 mph top speed",
    powertrainStrategy: "Turbo 4/6, mild hybrid, or efficient EV",
    designSignature: "Understated precision with simplified drama",
    notes: "Daily usability with approachable luxury"
  },
  [CarTier.MID_SIZE_LUXURY]: {
    priceBand: "$80k-$150k",
    segment: "Mid-size luxury sedan/GT/SUV",
    bodyStyle: "4-door sedan, 4-door coupe, or mid-size SUV",
    performanceGoal: "0-60 mph in 3.5-5s, 160-190 mph top speed",
    powertrainStrategy: "TT V6/V8, performance hybrid, or dual-motor EV",
    designSignature: "Balanced elegance with a confident stance",
    notes: "Tech-forward refinement with wider appeal"
  },
  [CarTier.FLAGSHIP]: {
    priceBand: "$150k-$300k+",
    segment: "Flagship full-size sedan or grand tourer",
    bodyStyle: "Full-size sedan, long-wheelbase, or 2+2 GT",
    performanceGoal: "0-60 mph in 3-4.5s, 180-205 mph top speed",
    powertrainStrategy: "V8/V12, high-performance hybrid, or flagship EV",
    designSignature: "Signature proportions with ceremonial presence",
    notes: "Craftsmanship and brand identity lead"
  },
  [CarTier.SUV_ESTATE]: {
    priceBand: "$80k-$250k+",
    segment: "Luxury SUV or estate",
    bodyStyle: "Performance SUV, coupe-SUV, or estate/wagon",
    performanceGoal: "0-60 mph in 3.5-5.5s, 155-190 mph top speed",
    powertrainStrategy: "High-output V6/V8, hybrid, or tri/quad-motor EV",
    designSignature: "Athletic massing with elevated stance",
    notes: "Practicality with presence and authority"
  },
  [CarTier.HYPERCAR]: {
    priceBand: "$800k-$3M+",
    segment: "Ultra low-volume hypercar",
    bodyStyle: "2-door coupe or targa",
    performanceGoal: "0-60 mph in 2-3s, 210+ mph top speed",
    powertrainStrategy: "Hybrid V8/V12 or tri/quad-motor EV",
    designSignature: "Extreme aero, cab-forward, dramatic surfaces",
    notes: "Technology showcase with track capability"
  }
};
