export interface FilterOption {
  id: string
  label: string
  value: string
}

export interface FilterValueMap {
  category: string | undefined
  location: string | undefined
  radius: string | undefined
  marke: string[]
  model: string[]
  bodyType: string[]
  fuel: string[]
  financing: string[]
  transmission: string | undefined
  condition: string | undefined
  yearFrom: string | undefined
  yearTo: string | undefined
  kilometerFrom: string | undefined
  kilometerTo: string | undefined
  powerFrom: string | undefined
  powerTo: string | undefined
  displacementFrom: string | undefined
  displacementTo: string | undefined
  minPrice: string
  maxPrice: string
  doors: string | undefined
  seats: string | undefined
  extras: string[]
}

export type FilterState = FilterValueMap

export type MultiFilterStateKey =
  | 'marke'
  | 'model'
  | 'bodyType'
  | 'fuel'
  | 'financing'
  | 'extras'
export type SingleFilterStateKey =
  | 'category'
  | 'location'
  | 'radius'
  | 'transmission'
  | 'condition'
  | 'doors'
  | 'seats'
export type RangeFromStateKey =
  | 'yearFrom'
  | 'kilometerFrom'
  | 'powerFrom'
  | 'displacementFrom'
export type RangeToStateKey =
  | 'yearTo'
  | 'kilometerTo'
  | 'powerTo'
  | 'displacementTo'

export const FILTER_DEFINITION_IDS = [
  'category',
  'marke',
  'model',
  'bodyType',
  'fuel',
  'financing',
  'transmission',
  'condition',
  'location',
  'radius',
  'year',
  'kilometer',
  'power',
  'displacement',
  'budget',
  'doors',
  'seats',
  'extras'
] as const

export type FilterDefinitionId = (typeof FILTER_DEFINITION_IDS)[number]

export const RANGE_FILTER_DEFINITION_IDS = [
  'year',
  'kilometer',
  'power',
  'displacement'
] as const
export type RangeFilterDefinitionId =
  (typeof RANGE_FILTER_DEFINITION_IDS)[number]

export type AppliedFilterKind =
  | 'category'
  | 'marke'
  | 'model'
  | 'bodyType'
  | 'fuel'
  | 'transmission'
  | 'condition'
  | 'location'
  | 'radius'
  | 'financing'
  | 'doors'
  | 'seats'
  | 'extra'
  | 'yearFrom'
  | 'yearTo'
  | 'kilometerFrom'
  | 'kilometerTo'
  | 'powerFrom'
  | 'powerTo'
  | 'displacementFrom'
  | 'displacementTo'
  | 'priceMin'
  | 'priceMax'

export interface AppliedFilter {
  id: string
  label: string
  kind: AppliedFilterKind
  value: string
  definitionId: FilterDefinitionId
}

export type FilterUigroup = 'budget' | 'vehicle' | 'extras'

interface BaseFilterDefinition {
  id: FilterDefinitionId
  label: string
  uiGroup: FilterUigroup
  order: number
}

export interface MultiFilterDefinition extends BaseFilterDefinition {
  type: 'multi'
  stateKey: MultiFilterStateKey
  appliedKind: Extract<
    AppliedFilterKind,
    'marke' | 'model' | 'bodyType' | 'fuel' | 'financing' | 'extra'
  >
  appliedLabel: string
  placeholder: string
  emptyText: string
  showChips?: boolean
  options: FilterOption[]
}

export interface SingleFilterDefinition extends BaseFilterDefinition {
  type: 'single'
  stateKey: SingleFilterStateKey
  appliedKind: Extract<
    AppliedFilterKind,
    | 'category'
    | 'location'
    | 'radius'
    | 'transmission'
    | 'condition'
    | 'doors'
    | 'seats'
  >
  appliedLabel: string
  placeholder: string
  options: FilterOption[]
}

export interface RangeFilterDefinition extends BaseFilterDefinition {
  id: RangeFilterDefinitionId
  type: 'range'
  fromKey: RangeFromStateKey
  toKey: RangeToStateKey
  fromKind: Extract<
    AppliedFilterKind,
    'yearFrom' | 'kilometerFrom' | 'powerFrom' | 'displacementFrom'
  >
  toKind: Extract<
    AppliedFilterKind,
    'yearTo' | 'kilometerTo' | 'powerTo' | 'displacementTo'
  >
  fromLabel: string
  toLabel: string
}

export interface PriceFilterDefinition extends BaseFilterDefinition {
  type: 'price'
  minKey: 'minPrice'
  maxKey: 'maxPrice'
  minKind: 'priceMin'
  maxKind: 'priceMax'
  minLabel: string
  maxLabel: string
}

export type FilterDefinition =
  | MultiFilterDefinition
  | SingleFilterDefinition
  | RangeFilterDefinition
  | PriceFilterDefinition
