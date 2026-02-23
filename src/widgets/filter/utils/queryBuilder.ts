import type { FilterState } from '@/widgets/filter/types/filters'

const CATEGORY_TO_CARTYPE: Readonly<Record<string, string>> = {
  PKW: 'pkw',
  Motorrad: 'zweirad',
  Transporter: 'nutzfahrzeug',
  Wohnmobil: 'wohnmobil',
  LKW: 'nutzfahrzeug'
}

const MARKE_TO_MANUFACTURER: Readonly<Record<string, string>> = {
  Audi: 'AUDI',
  BMW: 'BMW',
  'Mercedes-Benz': 'MERCEDES-BENZ',
  Skoda: 'SKODA',
  Volkswagen: 'VW'
}

const BODY_TYPE_TO_VEHICLE_SUBTYPE: Readonly<Record<string, string>> = {
  Kleinwagen: 'kleinwagen',
  SUV: 'suv',
  Limousine: 'limousine',
  Kombi: 'kombi',
  Van: 'van',
  Sportwagen: 'sportwagen',
  Coupe: 'sportwagen',
  Cabrio: 'cabrio',
  'Gelaendewagen/Pickup': 'geländewagen/pickup'
}

const FUEL_TO_FUEL_TYPE: Readonly<Record<string, string>> = {
  Benzin: 'BENZIN',
  Diesel: 'DIESEL',
  Elektro: 'ELEKTRO',
  Hybrid: 'HYBRID_BENZIN',
  LPG: 'LPG'
}

const TRANSMISSION_TO_GEARBOX_TYPE: Readonly<Record<string, string>> = {
  Automatik: 'AUTOMATIK',
  Schaltgetriebe: 'MANUELL'
}

const CONDITION_TO_USED_CONDITION_TYPE: Readonly<Record<string, string>> = {
  Neu: 'NEUWAGEN',
  Gebraucht: 'GEBRAUCHTWAGEN',
  Vorfuehrfahrzeug: 'VORFÜHRWAGEN',
  Jahreswagen: 'JAHRESWAGEN'
}

function appendMultiParam(searchParams: URLSearchParams, key: string, value: string[]): void {
  if (value.length === 0) {
    return
  }

  searchParams.set(key, value.join(','))
}

function appendSingleParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined
): void {
  if (!value) {
    return
  }

  searchParams.set(key, value)
}

function mapCategoryToCarType(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return CATEGORY_TO_CARTYPE[value] ?? value.toLowerCase()
}

function mapMarkeToManufacturer(value: string): string {
  return MARKE_TO_MANUFACTURER[value] ?? value.toUpperCase()
}

function mapBodyTypeToVehicleSubType(value: string): string {
  return BODY_TYPE_TO_VEHICLE_SUBTYPE[value] ?? value.toLowerCase()
}

function mapFuelToFuelType(value: string): string {
  return FUEL_TO_FUEL_TYPE[value] ?? value.toUpperCase()
}

function mapTransmissionToGearBoxType(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return TRANSMISSION_TO_GEARBOX_TYPE[value] ?? value.toUpperCase()
}

function mapConditionToUsedConditionType(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return CONDITION_TO_USED_CONDITION_TYPE[value] ?? value.toUpperCase()
}

function mapDoorsToRange(value: string | undefined): {
  minDoors: string | undefined
  maxDoors: string | undefined
} {
  if (value === '2/3') {
    return { minDoors: undefined, maxDoors: '3' }
  }

  if (value === '4/5') {
    return { minDoors: '4', maxDoors: '5' }
  }

  if (value === '6+') {
    return { minDoors: '6', maxDoors: undefined }
  }

  return { minDoors: undefined, maxDoors: undefined }
}

export function buildShopQueryFromFilterState(nextState: FilterState): string {
  const searchParams = new URLSearchParams()
  const carType = mapCategoryToCarType(nextState.category)
  const firstMarke = nextState.marke[0]
  const manufacturer = firstMarke ? mapMarkeToManufacturer(firstMarke) : undefined
  const vehicleSubTypes = nextState.bodyType.map(mapBodyTypeToVehicleSubType)
  const fuelTypes = nextState.fuel.map(mapFuelToFuelType)
  const transmission = mapTransmissionToGearBoxType(nextState.transmission)
  const usedConditionType = mapConditionToUsedConditionType(nextState.condition)
  const { minDoors, maxDoors } = mapDoorsToRange(nextState.doors)

  appendMultiParam(searchParams, 'carTypes', carType ? [carType] : [])
  appendSingleParam(searchParams, 'manufacturer', manufacturer)
  appendMultiParam(searchParams, 'models', nextState.model)
  appendMultiParam(searchParams, 'vehicleSubTypes', vehicleSubTypes)
  appendMultiParam(searchParams, 'fuelTypes', fuelTypes)
  appendMultiParam(searchParams, 'gearBoxTypes', transmission ? [transmission] : [])
  appendMultiParam(
    searchParams,
    'usedConditionTypes',
    usedConditionType ? [usedConditionType] : []
  )
  appendMultiParam(
    searchParams,
    'locationNames',
    nextState.location ? [nextState.location] : []
  )
  appendSingleParam(
    searchParams,
    'minInitialRegistration',
    nextState.yearFrom ? `${nextState.yearFrom}-01-01` : undefined
  )
  appendSingleParam(
    searchParams,
    'maxInitialRegistration',
    nextState.yearTo ? `${nextState.yearTo}-12-31` : undefined
  )
  appendSingleParam(searchParams, 'maxMileAge', nextState.kilometerTo)
  appendSingleParam(searchParams, 'minEnginePower', nextState.powerFrom)
  appendSingleParam(searchParams, 'maxEnginePower', nextState.powerTo)
  appendSingleParam(searchParams, 'engineCapacityMin', nextState.displacementFrom)
  appendSingleParam(searchParams, 'engineCapacityMax', nextState.displacementTo)
  appendSingleParam(searchParams, 'minPrice', nextState.minPrice)
  appendSingleParam(searchParams, 'maxPrice', nextState.maxPrice)
  appendSingleParam(searchParams, 'minDoors', minDoors)
  appendSingleParam(searchParams, 'maxDoors', maxDoors)
  appendSingleParam(searchParams, 'seatsMin', nextState.seats)
  appendSingleParam(searchParams, 'seatsMax', nextState.seats)

  return searchParams.toString()
}

export function mergeQueryParams(
  baseQueryParams: string | undefined,
  dynamicQueryParams: string
): string {
  const base = (baseQueryParams ?? '').trim()
  const dynamic = dynamicQueryParams.trim()

  if (!base) {
    return dynamic
  }

  if (!dynamic) {
    return base
  }

  return `${base}&${dynamic}`
}
