import type { FilterState } from '@/widgets/filter/types/filters'

export function cloneFilterState(source: FilterState): FilterState {
  return {
    rateView: source.rateView,
    category: source.category,
    location: source.location,
    radius: source.radius,
    marke: [...source.marke],
    model: [...source.model],
    bodyType: [...source.bodyType],
    fuel: [...source.fuel],
    financing: [...source.financing],
    transmission: source.transmission,
    condition: source.condition,
    yearFrom: source.yearFrom,
    yearTo: source.yearTo,
    kilometerFrom: source.kilometerFrom,
    kilometerTo: source.kilometerTo,
    powerFrom: source.powerFrom,
    powerTo: source.powerTo,
    displacementFrom: source.displacementFrom,
    displacementTo: source.displacementTo,
    minPrice: source.minPrice,
    maxPrice: source.maxPrice,
    doors: source.doors,
    seats: source.seats,
    extras: [...source.extras]
  }
}
