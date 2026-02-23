export interface FilterOption {
  id: string
  label: string
  value: string
}

export type FilterKind =
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
  kind: FilterKind
  value: string
}
