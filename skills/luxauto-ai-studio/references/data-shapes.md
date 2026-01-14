# Data Shapes

Keep all new fields backward-compatible and normalized.

## Brand
- `id`, `name`, `tagline`, `history`
- `designPhilosophy`, `colors[]`, `logoStyle`
- `materials`, `lightingSignature`, `aerodynamics`
- `establishedYear`, `headquarters`
- `lore[]` (optional)
- `brief` (optional)

## BrandBrief
- `archetype`, `clientProfile`, `performanceEthos`
- `materialEthos`, `lightingEthos`, `aeroEthos`

## CarModel
- `id`, `brandId`, `name`, `tagline`, `price`
- `tier`, `visualDescription`, `marketingBlurb`
- `specs` (CarSpecs)
- `variants[]` (CarVariant)
- `heroVariantId` (optional)
- `program` (optional)
- `reviews[]` (optional)
- `marketInsight` (optional)

## ModelProgram
- `segment`, `bodyStyle`, `targetBuyer`
- `priceBand`, `performanceGoal`, `powertrainStrategy`, `designSignature`

## CarVariant
- `id`, `prompt`, `imageUrl`, `createdAt`

## LoreEntry
- `id`, `title`, `content`, `year`, `imageUrl` (optional)

## Review
- `publication`, `author`, `score`, `headline`, `summary`
- `persona`: "PURIST" | "FUTURIST" | "LIFESTYLE"

## MarketInsight
- `collectorScore` (number)
- `resaleValue`, `targetDemographic`, `marketSentiment`
