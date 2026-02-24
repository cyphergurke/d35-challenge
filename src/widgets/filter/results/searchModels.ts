import type { SortKey } from '@/widgets/filter/results/types'
import type { FilterState } from '@/widgets/filter/types/filters'
import { cloneFilterState } from '@/widgets/filter/utils/filterState'

export type SearchAlertChannel = 'email' | 'push'
export type SearchAlertFrequency = 'instant' | 'daily' | 'weekly'

export interface QuietHours {
  start: string
  end: string
  timezone: string
}

export interface SavedSearch {
  id: string
  name: string
  query: {
    filters: FilterState
    sortKey: SortKey
  }
  createdAt: string
  updatedAt: string
}

export interface SearchAlert {
  id: string
  savedSearchId: string
  isActive: boolean
  channel: SearchAlertChannel
  target: string
  frequency: SearchAlertFrequency
  onlyOnNew: boolean
  dedupeSeen: boolean
  quietHours?: QuietHours
  lastNotifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SavedSearchCreateInput {
  name: string
  query: SavedSearch['query']
}

export interface SavedSearchUpdateInput {
  name?: string
  query?: SavedSearch['query']
}

export interface SearchAlertCreateInput {
  savedSearchId: string
  isActive: boolean
  channel: SearchAlertChannel
  target: string
  frequency: SearchAlertFrequency
  onlyOnNew: boolean
  dedupeSeen: boolean
  quietHours?: QuietHours
}

export interface SearchAlertUpdateInput {
  savedSearchId?: string
  isActive?: boolean
  channel?: SearchAlertChannel
  target?: string
  frequency?: SearchAlertFrequency
  onlyOnNew?: boolean
  dedupeSeen?: boolean
  quietHours?: QuietHours | null
  lastNotifiedAt?: string
}

export function cloneSavedSearchQuery(
  query: SavedSearch['query']
): SavedSearch['query'] {
  return {
    filters: cloneFilterState(query.filters),
    sortKey: query.sortKey
  }
}

export { cloneFilterState }

export function buildSavedSearchName(filters: FilterState): string {
  const make = filters.marke[0] ?? 'Alle Marken'
  const model = filters.model[0] ?? 'Alle Modelle'
  const yearRange =
    filters.yearFrom || filters.yearTo
      ? `${filters.yearFrom ?? 'Any'}-${filters.yearTo ?? 'Any'}`
      : 'Alle Baujahre'

  const minPrice = filters.minPrice.trim()
  const maxPrice = filters.maxPrice.trim()
  const priceRange =
    minPrice || maxPrice
      ? `${minPrice || '0'}-${maxPrice || 'Any'}EUR`
      : 'Alle Preise'

  return `${make} · ${model} · ${yearRange} · ${priceRange}`
}
