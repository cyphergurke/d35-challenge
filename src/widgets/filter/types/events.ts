import type { FilterState } from '@/widgets/filter/types/filters'

export interface FiltersAppliedDetail {
  query: string
  page: number
  refreshToken: number
  state: FilterState
}
