import { CarSpecs } from "../types.js";

export const DEFAULT_SPECS: CarSpecs = {
  engine: "",
  horsepower: "",
  torque: "",
  acceleration: "",
  topSpeed: "",
  weight: "",
  drivetrain: "",
  dimensions: "",
  transmission: "",
  dragCoefficient: "",
  suspension: "",
  brakes: "",
  wheelDesign: "",
  interiorMaterials: "",
  soundSystem: "",
  chassisConstruction: "",
  driverAssistance: ""
};

export const normalizeSpecs = (raw: any): CarSpecs => {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SPECS };
  const next: CarSpecs = { ...DEFAULT_SPECS };
  (Object.keys(DEFAULT_SPECS) as (keyof CarSpecs)[]).forEach((key) => {
    const value = raw[key];
    next[key] = typeof value === "string" ? value : "";
  });
  return next;
};
