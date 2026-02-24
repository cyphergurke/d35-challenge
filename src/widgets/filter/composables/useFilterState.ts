import { computed, reactive, watch, type ComputedRef } from 'vue'
import type {
  AppliedFilter,
  FilterDefinition,
  FilterOption,
  FilterState,
  MultiFilterDefinition,
  MultiFilterStateKey,
  PriceFilterDefinition,
  RangeFilterDefinition,
  SingleFilterDefinition,
  SingleFilterStateKey
} from '@/widgets/filter/types/filters'
import {
  bodyTypeOptions,
  categoryOptions,
  conditionOptions,
  doorOptions,
  extraOptions,
  financingOptions,
  fuelOptions,
  kilometerOptions,
  locationOptions,
  powerOptions,
  displacementOptions,
  markeOptions,
  maxKilometerValue,
  modelOptions,
  radiusOptions,
  seatOptions,
  transmissionOptions,
  yearOptions
} from '@/widgets/filter/data/options'
import { buildAppliedFiltersFromState } from '@/widgets/filter/results/buildAppliedFilters'
import { cloneFilterState } from '@/widgets/filter/utils/filterState'
import {
  isAllowedPriceKey,
  isValidNumericPaste,
  sanitizeNumericInput
} from '@/widgets/filter/utils/helpers'

const INITIAL_FILTER_STATE: FilterState = {
  category: '',
  location: undefined,
  radius: undefined,
  marke: [],
  model: [],
  bodyType: [],
  fuel: [],
  financing: [],
  transmission: undefined,
  condition: undefined,
  yearFrom: undefined,
  yearTo: undefined,
  kilometerFrom: undefined,
  kilometerTo: undefined,
  powerFrom: undefined,
  powerTo: undefined,
  displacementFrom: undefined,
  displacementTo: undefined,
  minPrice: '',
  maxPrice: '',
  doors: undefined,
  seats: undefined,
  extras: []
}

const FILTER_DEFINITIONS: readonly FilterDefinition[] = [
  {
    id: 'budget',
    label: 'Budget',
    uiGroup: 'budget',
    order: 10,
    type: 'price',
    minKey: 'minPrice',
    maxKey: 'maxPrice',
    minKind: 'priceMin',
    maxKind: 'priceMax',
    minLabel: 'Min',
    maxLabel: 'Max'
  },
  {
    id: 'financing',
    label: 'Finanzierungsart',
    uiGroup: 'budget',
    order: 20,
    type: 'multi',
    stateKey: 'financing',
    appliedKind: 'financing',
    appliedLabel: 'Finanzierung',
    placeholder: 'Finanzierung suchen',
    emptyText: 'Keine passende Finanzierungsart.',
    options: financingOptions
  },
  {
    id: 'location',
    label: 'Standort',
    uiGroup: 'budget',
    order: 30,
    type: 'single',
    stateKey: 'location',
    appliedKind: 'location',
    appliedLabel: 'Standort',
    placeholder: 'Standort waehlen',
    options: locationOptions
  },
  {
    id: 'radius',
    label: 'Radius',
    uiGroup: 'budget',
    order: 40,
    type: 'single',
    stateKey: 'radius',
    appliedKind: 'radius',
    appliedLabel: 'Radius',
    placeholder: 'Radius waehlen',
    options: radiusOptions
  },
  {
    id: 'category',
    label: 'Kategorie',
    uiGroup: 'vehicle',
    order: 10,
    type: 'single',
    stateKey: 'category',
    appliedKind: 'category',
    appliedLabel: 'Kategorie',
    placeholder: 'Kategorie wählen',
    options: categoryOptions
  },
  {
    id: 'marke',
    label: 'Marke',
    uiGroup: 'vehicle',
    order: 20,
    type: 'multi',
    stateKey: 'marke',
    appliedKind: 'marke',
    appliedLabel: 'Marke',
    placeholder: 'Marke suchen',
    emptyText: 'Keine passende Marke.',
    options: markeOptions
  },
  {
    id: 'model',
    label: 'Model',
    uiGroup: 'vehicle',
    order: 30,
    type: 'multi',
    stateKey: 'model',
    appliedKind: 'model',
    appliedLabel: 'Model',
    placeholder: 'Model suchen',
    emptyText: 'Kein passendes Model.',
    options: modelOptions
  },
  {
    id: 'bodyType',
    label: 'Karosserietyp',
    uiGroup: 'vehicle',
    order: 40,
    type: 'multi',
    stateKey: 'bodyType',
    appliedKind: 'bodyType',
    appliedLabel: 'Karosserietyp',
    placeholder: 'Karosserietyp suchen',
    emptyText: 'Kein passender Karosserietyp.',
    options: bodyTypeOptions
  },
  {
    id: 'fuel',
    label: 'Kraftstoff',
    uiGroup: 'vehicle',
    order: 50,
    type: 'multi',
    stateKey: 'fuel',
    appliedKind: 'fuel',
    appliedLabel: 'Kraftstoff',
    placeholder: 'Kraftstoff suchen',
    emptyText: 'Kein passender Kraftstoff.',
    options: fuelOptions
  },
  {
    id: 'transmission',
    label: 'Schaltung',
    uiGroup: 'vehicle',
    order: 60,
    type: 'single',
    stateKey: 'transmission',
    appliedKind: 'transmission',
    appliedLabel: 'Schaltung',
    placeholder: 'Schaltung wählen',
    options: transmissionOptions
  },
  {
    id: 'year',
    label: 'Erstzulassung',
    uiGroup: 'vehicle',
    order: 70,
    type: 'range',
    fromKey: 'yearFrom',
    toKey: 'yearTo',
    fromKind: 'yearFrom',
    toKind: 'yearTo',
    fromLabel: 'Baujahr von',
    toLabel: 'Baujahr bis'
  },
  {
    id: 'kilometer',
    label: 'Kilometer',
    uiGroup: 'vehicle',
    order: 80,
    type: 'range',
    fromKey: 'kilometerFrom',
    toKey: 'kilometerTo',
    fromKind: 'kilometerFrom',
    toKind: 'kilometerTo',
    fromLabel: 'Kilometer von',
    toLabel: 'Kilometer bis'
  },
  {
    id: 'power',
    label: 'Leistung',
    uiGroup: 'vehicle',
    order: 85,
    type: 'range',
    fromKey: 'powerFrom',
    toKey: 'powerTo',
    fromKind: 'powerFrom',
    toKind: 'powerTo',
    fromLabel: 'Leistung von',
    toLabel: 'Leistung bis'
  },
  {
    id: 'displacement',
    label: 'Hubraum',
    uiGroup: 'vehicle',
    order: 88,
    type: 'range',
    fromKey: 'displacementFrom',
    toKey: 'displacementTo',
    fromKind: 'displacementFrom',
    toKind: 'displacementTo',
    fromLabel: 'Hubraum von',
    toLabel: 'Hubraum bis'
  },
  {
    id: 'condition',
    label: 'Fahrzeugzustand',
    uiGroup: 'vehicle',
    order: 90,
    type: 'single',
    stateKey: 'condition',
    appliedKind: 'condition',
    appliedLabel: 'Fahrzeugzustand',
    placeholder: 'Zustand wählen',
    options: conditionOptions
  },
  {
    id: 'doors',
    label: 'Anzahl Tueren',
    uiGroup: 'extras',
    order: 10,
    type: 'single',
    stateKey: 'doors',
    appliedKind: 'doors',
    appliedLabel: 'Tueren',
    placeholder: 'Anzahl Tueren waehlen',
    options: doorOptions
  },
  {
    id: 'seats',
    label: 'Anzahl Sitze',
    uiGroup: 'extras',
    order: 20,
    type: 'single',
    stateKey: 'seats',
    appliedKind: 'seats',
    appliedLabel: 'Sitze',
    placeholder: 'Anzahl Sitze waehlen',
    options: seatOptions
  },
  {
    id: 'extras',
    label: 'Extras',
    uiGroup: 'extras',
    order: 30,
    type: 'multi',
    stateKey: 'extras',
    appliedKind: 'extra',
    appliedLabel: 'Extra',
    placeholder: 'Extras suchen',
    emptyText: 'Keine passenden Extras.',
    showChips: true,
    options: extraOptions
  }
]

function createFilterState(): FilterState {
  return cloneFilterState(INITIAL_FILTER_STATE)
}

function isMultiFilterDefinition(
  definition: FilterDefinition
): definition is MultiFilterDefinition {
  return definition.type === 'multi'
}

function isSingleFilterDefinition(
  definition: FilterDefinition
): definition is SingleFilterDefinition {
  return definition.type === 'single'
}

function isRangeFilterDefinition(
  definition: FilterDefinition
): definition is RangeFilterDefinition {
  return definition.type === 'range'
}

function sortByReadonlyOrder<T extends { order: number }>(
  definitions: readonly T[]
): T[] {
  return [...definitions].sort((a, b) => a.order - b.order)
}

export interface UseFilterStateResult {
  definitions: readonly FilterDefinition[]
  state: FilterState
  appliedFilters: ComputedRef<AppliedFilter[]>
  budgetDefinition: ComputedRef<PriceFilterDefinition | undefined>
  budgetSingleDefinitions: ComputedRef<SingleFilterDefinition[]>
  budgetMultiDefinitions: ComputedRef<MultiFilterDefinition[]>
  vehicleSingleDefinitions: ComputedRef<SingleFilterDefinition[]>
  vehicleMultiDefinitions: ComputedRef<MultiFilterDefinition[]>
  vehicleRangeDefinitions: ComputedRef<RangeFilterDefinition[]>
  extrasSingleDefinitions: ComputedRef<SingleFilterDefinition[]>
  extrasDefinition: ComputedRef<MultiFilterDefinition | undefined>
  yearOptions: FilterOption[]
  kilometerOptions: FilterOption[]
  powerOptions: FilterOption[]
  displacementOptions: FilterOption[]
  yearToOptions: ComputedRef<FilterOption[]>
  kilometerToOptions: ComputedRef<FilterOption[]>
  powerToOptions: ComputedRef<FilterOption[]>
  displacementToOptions: ComputedRef<FilterOption[]>
  isKilometerToDisabled: ComputedRef<boolean>
  createSnapshot: () => FilterState
  applySnapshot: (nextState: FilterState) => void
  getYearToOptionsFor: (yearFrom: string | undefined) => FilterOption[]
  getKilometerToOptionsFor: (
    kilometerFrom: string | undefined
  ) => FilterOption[]
  getPowerToOptionsFor: (powerFrom: string | undefined) => FilterOption[]
  getDisplacementToOptionsFor: (
    displacementFrom: string | undefined
  ) => FilterOption[]
  isKilometerToDisabledFor: (kilometerFrom: string | undefined) => boolean
  getMultiValue: (stateKey: MultiFilterStateKey) => string[]
  setMultiValue: (stateKey: MultiFilterStateKey, value: string[]) => void
  removeMultiValue: (stateKey: MultiFilterStateKey, value: string) => void
  clearMultiValue: (stateKey: MultiFilterStateKey) => void
  getSingleValue: (stateKey: SingleFilterStateKey) => string | undefined
  setSingleValue: (
    stateKey: SingleFilterStateKey,
    value: string | undefined
  ) => void
  clearDefinition: (definitionId: FilterDefinition['id']) => void
  clearAllFilters: () => void
  removeAppliedFilter: (filter: AppliedFilter) => void
  toggleExtra: (extra: string) => void
  setMinPrice: (value: string | number) => void
  setMaxPrice: (value: string | number) => void
  handlePriceKeydown: (event: KeyboardEvent) => void
  handlePricePaste: (event: ClipboardEvent) => void
}

export function useFilterState(): UseFilterStateResult {
  const state = reactive<FilterState>(createFilterState())
  const definitionById = new Map<FilterDefinition['id'], FilterDefinition>(
    FILTER_DEFINITIONS.map((definition) => [definition.id, definition])
  )

  const budgetDefinition = computed<PriceFilterDefinition | undefined>(() =>
    FILTER_DEFINITIONS.find(
      (definition): definition is PriceFilterDefinition =>
        definition.type === 'price' && definition.id === 'budget'
    )
  )

  const budgetSingleDefinitions = computed<SingleFilterDefinition[]>(() =>
    sortByReadonlyOrder(
      FILTER_DEFINITIONS.filter(isSingleFilterDefinition).filter(
        (definition) => definition.uiGroup === 'budget'
      )
    )
  )

  const budgetMultiDefinitions = computed<MultiFilterDefinition[]>(() =>
    sortByReadonlyOrder(
      FILTER_DEFINITIONS.filter(isMultiFilterDefinition).filter(
        (definition) => definition.uiGroup === 'budget'
      )
    )
  )

  const vehicleSingleDefinitions = computed<SingleFilterDefinition[]>(() =>
    sortByReadonlyOrder(
      FILTER_DEFINITIONS.filter(isSingleFilterDefinition).filter(
        (definition) => definition.uiGroup === 'vehicle'
      )
    )
  )

  const vehicleMultiDefinitions = computed<MultiFilterDefinition[]>(() =>
    sortByReadonlyOrder(
      FILTER_DEFINITIONS.filter(isMultiFilterDefinition).filter(
        (definition) => definition.uiGroup === 'vehicle'
      )
    )
  )

  const vehicleRangeDefinitions = computed<RangeFilterDefinition[]>(() =>
    sortByReadonlyOrder(
      FILTER_DEFINITIONS.filter(isRangeFilterDefinition).filter(
        (definition) => definition.uiGroup === 'vehicle'
      )
    )
  )

  const extrasSingleDefinitions = computed<SingleFilterDefinition[]>(() =>
    sortByReadonlyOrder(
      FILTER_DEFINITIONS.filter(isSingleFilterDefinition).filter(
        (definition) => definition.uiGroup === 'extras'
      )
    )
  )

  const extrasDefinition = computed(() =>
    FILTER_DEFINITIONS.find(
      (definition): definition is MultiFilterDefinition =>
        isMultiFilterDefinition(definition) && definition.id === 'extras'
    )
  )

  function getYearToOptionsFor(yearFrom: string | undefined): FilterOption[] {
    if (!yearFrom) {
      return yearOptions
    }

    const yearFromNumber = Number(yearFrom)
    return yearOptions.filter(
      (option) => Number(option.value) >= yearFromNumber
    )
  }

  function getKilometerToOptionsFor(
    kilometerFrom: string | undefined
  ): FilterOption[] {
    if (!kilometerFrom) {
      return kilometerOptions
    }

    if (kilometerFrom === maxKilometerValue) {
      return []
    }

    const kilometerFromNumber = Number(kilometerFrom)
    return kilometerOptions.filter(
      (option) => Number(option.value) >= kilometerFromNumber
    )
  }

  function getPowerToOptionsFor(powerFrom: string | undefined): FilterOption[] {
    if (!powerFrom) {
      return powerOptions
    }

    const powerFromNumber = Number(powerFrom)
    return powerOptions.filter(
      (option) => Number(option.value) >= powerFromNumber
    )
  }

  function getDisplacementToOptionsFor(
    displacementFrom: string | undefined
  ): FilterOption[] {
    if (!displacementFrom) {
      return displacementOptions
    }

    const displacementFromNumber = Number(displacementFrom)
    return displacementOptions.filter(
      (option) => Number(option.value) >= displacementFromNumber
    )
  }

  function isKilometerToDisabledFor(
    kilometerFrom: string | undefined
  ): boolean {
    return getKilometerToOptionsFor(kilometerFrom).length === 0
  }

  const yearToOptions = computed<FilterOption[]>(() =>
    getYearToOptionsFor(state.yearFrom)
  )

  const kilometerToOptions = computed<FilterOption[]>(() =>
    getKilometerToOptionsFor(state.kilometerFrom)
  )

  const isKilometerToDisabled = computed(() =>
    isKilometerToDisabledFor(state.kilometerFrom)
  )

  const powerToOptions = computed<FilterOption[]>(() =>
    getPowerToOptionsFor(state.powerFrom)
  )

  const displacementToOptions = computed<FilterOption[]>(() =>
    getDisplacementToOptionsFor(state.displacementFrom)
  )

  const appliedFilters = computed<AppliedFilter[]>(() =>
    buildAppliedFiltersFromState(state)
  )

  function getMultiValue(stateKey: MultiFilterStateKey): string[] {
    return state[stateKey]
  }

  function setMultiValue(stateKey: MultiFilterStateKey, value: string[]): void {
    state[stateKey] = [...value]
  }

  function removeMultiValue(
    stateKey: MultiFilterStateKey,
    value: string
  ): void {
    state[stateKey] = state[stateKey].filter((item) => item !== value)
  }

  function clearMultiValue(stateKey: MultiFilterStateKey): void {
    state[stateKey] = []
  }

  function getSingleValue(stateKey: SingleFilterStateKey): string | undefined {
    return state[stateKey]
  }

  function setSingleValue(
    stateKey: SingleFilterStateKey,
    value: string | undefined
  ): void {
    state[stateKey] = value
  }

  function createSnapshot(): FilterState {
    return cloneFilterState(state)
  }

  function applySnapshot(nextState: FilterState): void {
    Object.assign(state, cloneFilterState(nextState))
  }

  function clearDefinition(definitionId: FilterDefinition['id']): void {
    const definition = definitionById.get(definitionId)
    if (!definition) {
      return
    }

    if (definition.type === 'multi') {
      clearMultiValue(definition.stateKey)
      return
    }

    if (definition.type === 'single') {
      state[definition.stateKey] = undefined
      return
    }

    if (definition.type === 'range') {
      state[definition.fromKey] = undefined
      state[definition.toKey] = undefined
      return
    }

    state[definition.minKey] = ''
    state[definition.maxKey] = ''
  }

  function clearAllFilters(): void {
    for (const definition of FILTER_DEFINITIONS) {
      clearDefinition(definition.id)
    }
  }

  function removeAppliedFilter(filter: AppliedFilter): void {
    const definition = definitionById.get(filter.definitionId)
    if (!definition) {
      return
    }

    if (definition.type === 'multi') {
      removeMultiValue(definition.stateKey, filter.value)
      return
    }

    if (definition.type === 'single') {
      state[definition.stateKey] = undefined
      return
    }

    if (definition.type === 'range') {
      if (filter.kind === definition.fromKind) {
        state[definition.fromKey] = undefined
      } else if (filter.kind === definition.toKind) {
        state[definition.toKey] = undefined
      }
      return
    }

    if (filter.kind === definition.minKind) {
      state[definition.minKey] = ''
      return
    }

    if (filter.kind === definition.maxKind) {
      state[definition.maxKey] = ''
    }
  }

  function toggleExtra(extra: string): void {
    if (state.extras.includes(extra)) {
      removeMultiValue('extras', extra)
      return
    }

    setMultiValue('extras', [...state.extras, extra])
  }

  function setMinPrice(value: string | number): void {
    state.minPrice = sanitizeNumericInput(value)
  }

  function setMaxPrice(value: string | number): void {
    state.maxPrice = sanitizeNumericInput(value)
  }

  function handlePriceKeydown(event: KeyboardEvent): void {
    if (!isAllowedPriceKey(event)) {
      event.preventDefault()
    }
  }

  function handlePricePaste(event: ClipboardEvent): void {
    if (!isValidNumericPaste(event)) {
      event.preventDefault()
    }
  }

  watch(
    () => state.yearFrom,
    (nextFrom) => {
      if (!nextFrom || !state.yearTo) {
        return
      }

      if (Number(state.yearTo) < Number(nextFrom)) {
        state.yearTo = undefined
      }
    }
  )

  watch(
    () => state.kilometerFrom,
    (nextFrom) => {
      if (!nextFrom) {
        return
      }

      if (nextFrom === maxKilometerValue) {
        state.kilometerTo = undefined
        return
      }

      if (!state.kilometerTo) {
        return
      }

      if (Number(state.kilometerTo) < Number(nextFrom)) {
        state.kilometerTo = undefined
      }
    }
  )

  watch(
    () => state.powerFrom,
    (nextFrom) => {
      if (!nextFrom || !state.powerTo) {
        return
      }

      if (Number(state.powerTo) < Number(nextFrom)) {
        state.powerTo = undefined
      }
    }
  )

  watch(
    () => state.displacementFrom,
    (nextFrom) => {
      if (!nextFrom || !state.displacementTo) {
        return
      }

      if (Number(state.displacementTo) < Number(nextFrom)) {
        state.displacementTo = undefined
      }
    }
  )

  return {
    definitions: FILTER_DEFINITIONS,
    state,
    appliedFilters,
    budgetDefinition,
    budgetSingleDefinitions,
    budgetMultiDefinitions,
    vehicleSingleDefinitions,
    vehicleMultiDefinitions,
    vehicleRangeDefinitions,
    extrasSingleDefinitions,
    extrasDefinition,
    yearOptions,
    kilometerOptions,
    powerOptions,
    displacementOptions,
    yearToOptions,
    kilometerToOptions,
    powerToOptions,
    displacementToOptions,
    isKilometerToDisabled,
    createSnapshot,
    applySnapshot,
    getYearToOptionsFor,
    getKilometerToOptionsFor,
    getPowerToOptionsFor,
    getDisplacementToOptionsFor,
    isKilometerToDisabledFor,
    getMultiValue,
    setMultiValue,
    removeMultiValue,
    clearMultiValue,
    getSingleValue,
    setSingleValue,
    clearDefinition,
    clearAllFilters,
    removeAppliedFilter,
    toggleExtra,
    setMinPrice,
    setMaxPrice,
    handlePriceKeydown,
    handlePricePaste
  }
}
