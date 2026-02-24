import type { AppliedFilter, AppliedFilterKind, FilterDefinitionId, FilterState } from '@/widgets/filter/types/filters'

interface SingleFieldConfig {
  definitionId: FilterDefinitionId
  kind: AppliedFilterKind
  label: string
}

function pushSingleFilter(
  target: AppliedFilter[],
  definition: SingleFieldConfig,
  value: string | undefined
): void {
  if (!value) {
    return
  }

  target.push({
    id: `${definition.definitionId}-${value}`,
    label: `${definition.label}: ${value}`,
    kind: definition.kind,
    value,
    definitionId: definition.definitionId
  })
}

function pushMultiFilters(
  target: AppliedFilter[],
  definitionId: FilterDefinitionId,
  kind: AppliedFilterKind,
  label: string,
  values: string[]
): void {
  for (const value of values) {
    target.push({
      id: `${definitionId}-${value}`,
      label: `${label}: ${value}`,
      kind,
      value,
      definitionId
    })
  }
}

function pushRangeFilter(
  target: AppliedFilter[],
  definitionId: FilterDefinitionId,
  fromLabel: string,
  fromKind: AppliedFilterKind,
  fromValue: string | undefined,
  toLabel: string,
  toKind: AppliedFilterKind,
  toValue: string | undefined
): void {
  if (fromValue) {
    target.push({
      id: `${definitionId}-from-${fromValue}`,
      label: `${fromLabel}: ${fromValue}`,
      kind: fromKind,
      value: fromValue,
      definitionId
    })
  }

  if (!toValue) {
    return
  }

  target.push({
    id: `${definitionId}-to-${toValue}`,
    label: `${toLabel}: ${toValue}`,
    kind: toKind,
    value: toValue,
    definitionId
  })
}

export function buildAppliedFiltersFromState(state: FilterState): AppliedFilter[] {
  const filters: AppliedFilter[] = []

  pushSingleFilter(filters, { definitionId: 'category', kind: 'category', label: 'Kategorie' }, state.category)
  pushSingleFilter(filters, { definitionId: 'location', kind: 'location', label: 'Standort' }, state.location)
  pushSingleFilter(filters, { definitionId: 'radius', kind: 'radius', label: 'Radius' }, state.radius)
  pushMultiFilters(filters, 'marke', 'marke', 'Marke', state.marke)
  pushMultiFilters(filters, 'model', 'model', 'Model', state.model)
  pushMultiFilters(filters, 'bodyType', 'bodyType', 'Karosserietyp', state.bodyType)
  pushMultiFilters(filters, 'fuel', 'fuel', 'Kraftstoff', state.fuel)
  pushMultiFilters(filters, 'financing', 'financing', 'Finanzierung', state.financing)
  pushSingleFilter(
    filters,
    { definitionId: 'transmission', kind: 'transmission', label: 'Schaltung' },
    state.transmission
  )
  pushSingleFilter(
    filters,
    { definitionId: 'condition', kind: 'condition', label: 'Fahrzeugzustand' },
    state.condition
  )

  pushRangeFilter(
    filters,
    'year',
    'Baujahr von',
    'yearFrom',
    state.yearFrom,
    'Baujahr bis',
    'yearTo',
    state.yearTo
  )
  pushRangeFilter(
    filters,
    'kilometer',
    'Kilometer von',
    'kilometerFrom',
    state.kilometerFrom,
    'Kilometer bis',
    'kilometerTo',
    state.kilometerTo
  )
  pushRangeFilter(
    filters,
    'power',
    'Leistung von',
    'powerFrom',
    state.powerFrom,
    'Leistung bis',
    'powerTo',
    state.powerTo
  )
  pushRangeFilter(
    filters,
    'displacement',
    'Hubraum von',
    'displacementFrom',
    state.displacementFrom,
    'Hubraum bis',
    'displacementTo',
    state.displacementTo
  )

  const minPrice = state.minPrice.trim()
  if (minPrice) {
    filters.push({
      id: `budget-min-${minPrice}`,
      label: `Min: ${minPrice} EUR`,
      kind: 'priceMin',
      value: minPrice,
      definitionId: 'budget'
    })
  }

  const maxPrice = state.maxPrice.trim()
  if (maxPrice) {
    filters.push({
      id: `budget-max-${maxPrice}`,
      label: `Max: ${maxPrice} EUR`,
      kind: 'priceMax',
      value: maxPrice,
      definitionId: 'budget'
    })
  }

  pushSingleFilter(filters, { definitionId: 'doors', kind: 'doors', label: 'Tueren' }, state.doors)
  pushSingleFilter(filters, { definitionId: 'seats', kind: 'seats', label: 'Sitze' }, state.seats)
  pushMultiFilters(filters, 'extras', 'extra', 'Extra', state.extras)

  return filters
}
