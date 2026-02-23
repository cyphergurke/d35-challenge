export interface FilterOption {
  id: string
  label: string
  value: string
}

export interface FilterValueMap {
  category?: string
  marke: string[]
  model: string[]
  bodyType: string[]
  fuel: string[]
  financing: string[]
  transmission?: string
  condition?: string
  yearFrom?: string
  yearTo?: string
  kilometerFrom?: string
  kilometerTo?: string
  minPrice: string
  maxPrice: string
  doors?: string
  seats?: string
  extras: string[]
  extrasSearch: string
}

export type FilterState = FilterValueMap

export type MultiFilterStateKey = 'marke' | 'model' | 'bodyType' | 'fuel' | 'financing' | 'extras'
export type SingleFilterStateKey = 'category' | 'transmission' | 'condition' | 'doors' | 'seats'
export type RangeFromStateKey = 'yearFrom' | 'kilometerFrom'
export type RangeToStateKey = 'yearTo' | 'kilometerTo'

export type FilterDefinitionId =
  | 'category'
  | 'marke'
  | 'model'
  | 'bodyType'
  | 'fuel'
  | 'financing'
  | 'transmission'
  | 'condition'
  | 'year'
  | 'kilometer'
  | 'budget'
  | 'doors'
  | 'seats'
  | 'extras'

export type AppliedFilterKind =
  | 'category'
  | 'marke'
  | 'model'
  | 'bodyType'
  | 'fuel'
  | 'transmission'
  | 'condition'
  | 'financing'
  | 'doors'
  | 'seats'
  | 'extra'
  | 'yearFrom'
  | 'yearTo'
  | 'kilometerFrom'
  | 'kilometerTo'
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
  appliedKind: Extract<AppliedFilterKind, 'marke' | 'model' | 'bodyType' | 'fuel' | 'financing' | 'extra'>
  appliedLabel: string
  placeholder: string
  emptyText: string
  showChips?: boolean
  options: FilterOption[]
}

export interface SingleFilterDefinition extends BaseFilterDefinition {
  type: 'single'
  stateKey: SingleFilterStateKey
  appliedKind: Extract<AppliedFilterKind, 'category' | 'transmission' | 'condition' | 'doors' | 'seats'>
  appliedLabel: string
  placeholder: string
  options: FilterOption[]
}

export interface RangeFilterDefinition extends BaseFilterDefinition {
  type: 'range'
  fromKey: RangeFromStateKey
  toKey: RangeToStateKey
  fromKind: Extract<AppliedFilterKind, 'yearFrom' | 'kilometerFrom'>
  toKind: Extract<AppliedFilterKind, 'yearTo' | 'kilometerTo'>
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
