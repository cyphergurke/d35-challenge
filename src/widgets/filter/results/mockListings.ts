import type { CarListing, DoorGroup } from '@/widgets/filter/results/types'

interface ListingBlueprint {
  make: string
  model: string
  category: string
  bodyType: string
  fuel: string
  transmission: string
  condition: string
  doors: DoorGroup
  seats: number
  location: string
  financingOptions: string[]
  basePrice: number
  basePowerPs: number
  baseDisplacementCcm: number
  monthlyBase?: number
  extras: string[]
}

const BLUEPRINTS: readonly ListingBlueprint[] = [
  {
    make: 'Audi',
    model: 'A1',
    category: 'PKW',
    bodyType: 'Kleinwagen',
    fuel: 'Benzin',
    transmission: 'Schaltgetriebe',
    condition: 'Gebraucht',
    doors: '4/5',
    seats: 5,
    location: 'Berlin',
    financingOptions: ['Leasing', 'Kredit'],
    basePrice: 16990,
    basePowerPs: 95,
    baseDisplacementCcm: 999,
    monthlyBase: 189,
    extras: ['Klimaanlage', 'Bluetooth', 'Tempomat']
  },
  {
    make: 'BMW',
    model: '3 Series',
    category: 'PKW',
    bodyType: 'Limousine',
    fuel: 'Diesel',
    transmission: 'Automatik',
    condition: 'Gebraucht',
    doors: '4/5',
    seats: 5,
    location: 'Hamburg',
    financingOptions: ['Leasing', 'Ballonfinanzierung'],
    basePrice: 28990,
    basePowerPs: 190,
    baseDisplacementCcm: 1995,
    monthlyBase: 329,
    extras: ['Klimaautomatik', 'Navigationssystem', 'Rueckfahrkamera']
  },
  {
    make: 'Mercedes-Benz',
    model: 'GLC',
    category: 'PKW',
    bodyType: 'suv',
    fuel: 'Hybrid',
    transmission: 'Automatik',
    condition: 'Jahreswagen',
    doors: '4/5',
    seats: 5,
    location: 'Muenchen',
    financingOptions: ['Leasing', 'Kredit', 'Abo'],
    basePrice: 42990,
    basePowerPs: 245,
    baseDisplacementCcm: 1991,
    monthlyBase: 469,
    extras: ['LED-Scheinwerfer', 'Apple CarPlay', 'Spurhalteassistent']
  },
  {
    make: 'Skoda',
    model: 'Enyaq',
    category: 'PKW',
    bodyType: 'suv',
    fuel: 'Elektro',
    transmission: 'Automatik',
    condition: 'Vorfuehrfahrzeug',
    doors: '4/5',
    seats: 5,
    location: 'Koeln',
    financingOptions: ['Leasing', 'Abo'],
    basePrice: 37990,
    basePowerPs: 204,
    baseDisplacementCcm: 0,
    monthlyBase: 399,
    extras: ['360 Kamera', 'Panoramadach', 'Keyless Entry']
  },
  {
    make: 'Volkswagen',
    model: 'Tiguan',
    category: 'PKW',
    bodyType: 'suv',
    fuel: 'Benzin',
    transmission: 'Automatik',
    condition: 'Gebraucht',
    doors: '4/5',
    seats: 5,
    location: 'Frankfurt am Main',
    financingOptions: ['Kredit', 'Ratenkauf'],
    basePrice: 31990,
    basePowerPs: 150,
    baseDisplacementCcm: 1498,
    monthlyBase: 339,
    extras: ['Android Auto', 'Einparkhilfe', 'Anhaengerkupplung']
  },
  {
    make: 'Audi',
    model: 'A1',
    category: 'PKW',
    bodyType: 'Kleinwagen',
    fuel: 'Benzin',
    transmission: 'Automatik',
    condition: 'Neu',
    doors: '2/3',
    seats: 4,
    location: 'Stuttgart',
    financingOptions: ['Leasing', 'Abo'],
    basePrice: 23990,
    basePowerPs: 116,
    baseDisplacementCcm: 1498,
    monthlyBase: 259,
    extras: ['Klimaanlage', 'DAB Radio', 'Apple CarPlay']
  },
  {
    make: 'BMW',
    model: '3 Series',
    category: 'PKW',
    bodyType: 'Kombi',
    fuel: 'Diesel',
    transmission: 'Automatik',
    condition: 'Jahreswagen',
    doors: '4/5',
    seats: 5,
    location: 'Berlin',
    financingOptions: ['Leasing', 'Kredit'],
    basePrice: 35990,
    basePowerPs: 200,
    baseDisplacementCcm: 1998,
    monthlyBase: 379,
    extras: ['Adaptiver Tempomat', 'Lederausstattung', 'Totwinkelassistent']
  },
  {
    make: 'Mercedes-Benz',
    model: 'GLC',
    category: 'PKW',
    bodyType: 'suv',
    fuel: 'Diesel',
    transmission: 'Automatik',
    condition: 'Gebraucht',
    doors: '4/5',
    seats: 5,
    location: 'Hamburg',
    financingOptions: ['Kredit', 'Ballonfinanzierung'],
    basePrice: 38990,
    basePowerPs: 194,
    baseDisplacementCcm: 1950,
    monthlyBase: 419,
    extras: ['Anhaengerkupplung', 'Allradantrieb', 'Rueckfahrkamera']
  },
  {
    make: 'Skoda',
    model: 'Enyaq',
    category: 'PKW',
    bodyType: 'suv',
    fuel: 'Elektro',
    transmission: 'Automatik',
    condition: 'Neu',
    doors: '4/5',
    seats: 5,
    location: 'Muenchen',
    financingOptions: ['Leasing', 'Abo'],
    basePrice: 44990,
    basePowerPs: 265,
    baseDisplacementCcm: 0,
    monthlyBase: 499,
    extras: ['360 Kamera', 'Panoramadach', 'Adaptives Licht']
  },
  {
    make: 'Volkswagen',
    model: 'Tiguan',
    category: 'PKW',
    bodyType: 'suv',
    fuel: 'Hybrid',
    transmission: 'Automatik',
    condition: 'Vorfuehrfahrzeug',
    doors: '4/5',
    seats: 5,
    location: 'Koeln',
    financingOptions: ['Leasing', 'Kredit', 'Ratenkauf'],
    basePrice: 40990,
    basePowerPs: 245,
    baseDisplacementCcm: 1395,
    monthlyBase: 449,
    extras: ['Spurhalteassistent', 'Notbremsassistent', 'Navigationssystem']
  }
]

const EXTRA_ROTATION: readonly string[] = [
  'Klimaanlage',
  'Klimaanlage',
  'Sitzheizung',
  'LED-Scheinwerfer',
  'Adaptiver Tempomat',
  'Rueckfahrkamera',
  'Navigationssystem',
  'Apple CarPlay',
  'Android Auto',
  'Totwinkelassistent',
  'Spurhalteassistent',
  'Anhaengerkupplung'
]

function pickByIndex<T>(items: readonly T[], index: number): T {
  const picked = items[index % items.length]
  if (!picked) {
    throw new Error('Mock list is empty')
  }

  return picked
}

function createExtras(baseExtras: readonly string[], index: number): string[] {
  const extraA = pickByIndex(EXTRA_ROTATION, index)
  const extraB = pickByIndex(EXTRA_ROTATION, index + 3)
  const extras = new Set<string>([...baseExtras, extraA, extraB])
  return Array.from(extras)
}

function createListing(index: number): CarListing {
  const blueprint = pickByIndex(BLUEPRINTS, index)
  const modelCycle = index % 6
  const year = 2017 + (index % 9)
  const kilometers = 5000 + modelCycle * 11000 + (index % 4) * 8000
  const price = blueprint.basePrice + modelCycle * 1450 + (2026 - year) * 420
  const monthlyRate = blueprint.monthlyBase
    ? blueprint.monthlyBase + modelCycle * 14
    : undefined
  const has360 = index % 3 === 0
  const consumption =
    blueprint.fuel === 'Elektro'
      ? undefined
      : (4.6 + (index % 6) * 0.4).toFixed(1)
  const emissions =
    blueprint.fuel === 'Elektro' ? undefined : `${98 + (index % 8) * 9} g/km`
  const relevanceScore = 100 - (index % 35)
  const createdAt = new Date(
    Date.UTC(2024 + (index % 2), index % 12, (index % 27) + 1)
  ).toISOString()

  return {
    id: `car-${index + 1}`,
    title: `${blueprint.make} ${blueprint.model}`,
    subtitle: `${blueprint.condition} | ${blueprint.bodyType} | ${blueprint.location}`,
    detailUrl: '#',
    imageUrl: `https://picsum.photos/seed/d35-car-${index + 1}/960/640`,
    category: blueprint.category,
    make: blueprint.make,
    model: blueprint.model,
    bodyType: blueprint.bodyType,
    fuel: blueprint.fuel,
    transmission: blueprint.transmission,
    condition: blueprint.condition,
    year,
    kilometers,
    powerPs: blueprint.basePowerPs + modelCycle * 8,
    displacementCcm: blueprint.baseDisplacementCcm,
    price,
    monthlyRate,
    has360,
    doors: blueprint.doors,
    seats: blueprint.seats,
    extras: createExtras(blueprint.extras, index),
    financingOptions: [...blueprint.financingOptions],
    location: blueprint.location,
    consumptionText: consumption ? `${consumption} l/100km` : undefined,
    emissionsText: emissions,
    relevanceScore,
    createdAt
  }
}

export const mockListings: readonly CarListing[] = Array.from(
  { length: 60 },
  (_, index) => createListing(index)
)
