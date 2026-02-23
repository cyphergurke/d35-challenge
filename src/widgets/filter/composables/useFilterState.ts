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
  powerOptions,
  displacementOptions,
  markeOptions,
  maxKilometerValue,
  modelOptions,
  seatOptions,
  transmissionOptions,
  yearOptions
} from '@/widgets/filter/data/options'
import { isAllowedPriceKey, isValidNumericPaste, sanitizeNumericInput } from '@/widgets/filter/utils/helpers'

const INITIAL_FILTER_STATE: FilterState = {
  category: 'PKW',
  marke: ['Audi', 'BMW'],
  model: ['3 Series', 'A1'],
  bodyType: ['SUV'],
  fuel: ['Benzin'],
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
  extras: [],
  extrasSearch: ''
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
  return {
    ...INITIAL_FILTER_STATE,
    marke: [...INITIAL_FILTER_STATE.marke],
    model: [...INITIAL_FILTER_STATE.model],
    bodyType: [...INITIAL_FILTER_STATE.bodyType],
    fuel: [...INITIAL_FILTER_STATE.fuel],
    financing: [...INITIAL_FILTER_STATE.financing],
    extras: [...INITIAL_FILTER_STATE.extras]
  }
}

function isMultiFilterDefinition(definition: FilterDefinition): definition is MultiFilterDefinition {
  return definition.type === 'multi'
}

function isSingleFilterDefinition(definition: FilterDefinition): definition is SingleFilterDefinition {
  return definition.type === 'single'
}

function isRangeFilterDefinition(definition: FilterDefinition): definition is RangeFilterDefinition {
  return definition.type === 'range'
}

function sortByReadonlyOrder<T extends { order: number }>(definitions: readonly T[]): T[] {
  return [...definitions].sort((a, b) => a.order - b.order)
}

export interface UseFilterStateResult {
  definitions: readonly FilterDefinition[]
  state: FilterState
  appliedFilters: ComputedRef<AppliedFilter[]>
  budgetDefinition: ComputedRef<PriceFilterDefinition | undefined>
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
  filteredExtraOptions: ComputedRef<FilterOption[]>
  getMultiValue: (stateKey: MultiFilterStateKey) => string[]
  setMultiValue: (stateKey: MultiFilterStateKey, value: string[]) => void
  removeMultiValue: (stateKey: MultiFilterStateKey, value: string) => void
  clearMultiValue: (stateKey: MultiFilterStateKey) => void
  getSingleValue: (stateKey: SingleFilterStateKey) => string | undefined
  setSingleValue: (stateKey: SingleFilterStateKey, value: string | undefined) => void
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

  const yearToOptions = computed<FilterOption[]>(() => {
    if (!state.yearFrom) {
      return yearOptions
    }

    const yearFromNumber = Number(state.yearFrom)
    return yearOptions.filter((option) => Number(option.value) >= yearFromNumber)
  })

  const kilometerToOptions = computed<FilterOption[]>(() => {
    if (!state.kilometerFrom) {
      return kilometerOptions
    }

    if (state.kilometerFrom === maxKilometerValue) {
      return []
    }

    const kilometerFromNumber = Number(state.kilometerFrom)
    return kilometerOptions.filter((option) => Number(option.value) >= kilometerFromNumber)
  })

  const isKilometerToDisabled = computed(() => kilometerToOptions.value.length === 0)

  const powerToOptions = computed<FilterOption[]>(() => {
    if (!state.powerFrom) {
      return powerOptions
    }

    const powerFromNumber = Number(state.powerFrom)
    return powerOptions.filter((option) => Number(option.value) >= powerFromNumber)
  })

  const displacementToOptions = computed<FilterOption[]>(() => {
    if (!state.displacementFrom) {
      return displacementOptions
    }

    const displacementFromNumber = Number(state.displacementFrom)
    return displacementOptions.filter((option) => Number(option.value) >= displacementFromNumber)
  })

  const filteredExtraOptions = computed<FilterOption[]>(() => {
    const normalizedSearch = state.extrasSearch.trim().toLowerCase()
    if (!normalizedSearch) {
      return extraOptions
    }

    return extraOptions.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
  })

  const appliedFilters = computed<AppliedFilter[]>(() => {
    const filters: AppliedFilter[] = []

    for (const definition of FILTER_DEFINITIONS) {
      if (definition.type === 'multi') {
        for (const selectedValue of state[definition.stateKey]) {
          filters.push({
            id: `${definition.id}-${selectedValue}`,
            label: `${definition.appliedLabel}: ${selectedValue}`,
            kind: definition.appliedKind,
            value: selectedValue,
            definitionId: definition.id
          })
        }
        continue
      }

      if (definition.type === 'single') {
        const selectedValue = state[definition.stateKey]
        if (!selectedValue) {
          continue
        }

        filters.push({
          id: `${definition.id}-${selectedValue}`,
          label: `${definition.appliedLabel}: ${selectedValue}`,
          kind: definition.appliedKind,
          value: selectedValue,
          definitionId: definition.id
        })
        continue
      }

      if (definition.type === 'range') {
        const fromValue = state[definition.fromKey]
        if (fromValue) {
          filters.push({
            id: `${definition.id}-from`,
            label: `${definition.fromLabel}: ${fromValue}`,
            kind: definition.fromKind,
            value: fromValue,
            definitionId: definition.id
          })
        }

        const toValue = state[definition.toKey]
        if (toValue) {
          filters.push({
            id: `${definition.id}-to`,
            label: `${definition.toLabel}: ${toValue}`,
            kind: definition.toKind,
            value: toValue,
            definitionId: definition.id
          })
        }
        continue
      }

      const minValue = state[definition.minKey].trim()
      if (minValue) {
        filters.push({
          id: `${definition.id}-min`,
          label: `${definition.minLabel}: ${minValue} €`,
          kind: definition.minKind,
          value: minValue,
          definitionId: definition.id
        })
      }

      const maxValue = state[definition.maxKey].trim()
      if (maxValue) {
        filters.push({
          id: `${definition.id}-max`,
          label: `${definition.maxLabel}: ${maxValue} €`,
          kind: definition.maxKind,
          value: maxValue,
          definitionId: definition.id
        })
      }
    }

    return filters
  })

  function getMultiValue(stateKey: MultiFilterStateKey): string[] {
    return state[stateKey]
  }

  function setMultiValue(stateKey: MultiFilterStateKey, value: string[]): void {
    state[stateKey] = [...value]
  }

  function removeMultiValue(stateKey: MultiFilterStateKey, value: string): void {
    state[stateKey] = state[stateKey].filter((item) => item !== value)
  }

  function clearMultiValue(stateKey: MultiFilterStateKey): void {
    state[stateKey] = []
  }

  function getSingleValue(stateKey: SingleFilterStateKey): string | undefined {
    return state[stateKey]
  }

  function setSingleValue(stateKey: SingleFilterStateKey, value: string | undefined): void {
    state[stateKey] = value
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
    filteredExtraOptions,
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
