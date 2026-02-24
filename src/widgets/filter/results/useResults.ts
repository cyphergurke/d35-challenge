import { computed, type ComputedRef, type Ref } from 'vue'
import { mockListings } from '@/widgets/filter/results/mockListings'
import type { CarListing, SortKey } from '@/widgets/filter/results/types'
import type { FilterState } from '@/widgets/filter/types/filters'

interface UseResultsParams {
  filterState: FilterState
  sortKey: Ref<SortKey>
  page: Ref<number>
  pageSize: Ref<number>
  favorites: Ref<Set<string>>
  sourceItems?: readonly CarListing[]
}

interface UseResultsReturn {
  filteredItems: ComputedRef<CarListing[]>
  pagedItems: ComputedRef<CarListing[]>
  totalCount: ComputedRef<number>
  totalPages: ComputedRef<number>
  isEmpty: ComputedRef<boolean>
  currentPage: ComputedRef<number>
  favoritesCount: ComputedRef<number>
  isFavorite: (listingId: string) => boolean
  toggleFavorite: (listingId: string) => void
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function hasIntersection(selected: string[], values: string[]): boolean {
  return selected.some((entry) => values.includes(entry))
}

function toTimestamp(input: string): number {
  const timestamp = Date.parse(input)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function useResults(params: UseResultsParams): UseResultsReturn {
  const sourceItems = params.sourceItems ?? mockListings

  const filteredItems = computed<CarListing[]>(() => {
    const state = params.filterState
    const minPrice = parseNumber(state.minPrice)
    const maxPrice = parseNumber(state.maxPrice)
    const yearFrom = parseNumber(state.yearFrom)
    const yearTo = parseNumber(state.yearTo)
    const kilometerFrom = parseNumber(state.kilometerFrom)
    const kilometerTo = parseNumber(state.kilometerTo)
    const powerFrom = parseNumber(state.powerFrom)
    const powerTo = parseNumber(state.powerTo)
    const displacementFrom = parseNumber(state.displacementFrom)
    const displacementTo = parseNumber(state.displacementTo)
    const seats = parseNumber(state.seats)

    return sourceItems.filter((item) => {
      if (state.category && item.category !== state.category) {
        return false
      }

      if (state.location && item.location && item.location !== state.location) {
        return false
      }

      if (state.marke.length > 0 && !state.marke.includes(item.make)) {
        return false
      }

      if (state.model.length > 0 && !state.model.includes(item.model)) {
        return false
      }

      if (state.bodyType.length > 0 && !state.bodyType.includes(item.bodyType)) {
        return false
      }

      if (state.fuel.length > 0 && !state.fuel.includes(item.fuel)) {
        return false
      }

      if (state.financing.length > 0 && !hasIntersection(state.financing, item.financingOptions)) {
        return false
      }

      if (state.transmission && item.transmission !== state.transmission) {
        return false
      }

      if (state.condition && item.condition !== state.condition) {
        return false
      }

      if (yearFrom !== undefined && item.year < yearFrom) {
        return false
      }

      if (yearTo !== undefined && item.year > yearTo) {
        return false
      }

      if (kilometerFrom !== undefined && item.kilometers < kilometerFrom) {
        return false
      }

      if (kilometerTo !== undefined && item.kilometers > kilometerTo) {
        return false
      }

      if (powerFrom !== undefined && item.powerPs < powerFrom) {
        return false
      }

      if (powerTo !== undefined && item.powerPs > powerTo) {
        return false
      }

      if (displacementFrom !== undefined && item.displacementCcm < displacementFrom) {
        return false
      }

      if (displacementTo !== undefined && item.displacementCcm > displacementTo) {
        return false
      }

      if (minPrice !== undefined && item.price < minPrice) {
        return false
      }

      if (maxPrice !== undefined && item.price > maxPrice) {
        return false
      }

      if (state.doors && item.doors !== state.doors) {
        return false
      }

      if (seats !== undefined && item.seats !== seats) {
        return false
      }

      if (state.extras.length > 0) {
        const hasAllExtras = state.extras.every((extra) => item.extras.includes(extra))
        if (!hasAllExtras) {
          return false
        }
      }

      return true
    })
  })

  const sortedItems = computed<CarListing[]>(() => {
    const items = [...filteredItems.value]

    items.sort((left, right) => {
      switch (params.sortKey.value) {
        case 'priceAsc':
          return left.price - right.price
        case 'priceDesc':
          return right.price - left.price
        case 'newest':
          return right.year - left.year
        case 'mileageAsc':
          return left.kilometers - right.kilometers
        case 'relevance':
        default: {
          const relevanceDiff = right.relevanceScore - left.relevanceScore
          if (relevanceDiff !== 0) {
            return relevanceDiff
          }

          return toTimestamp(right.createdAt) - toTimestamp(left.createdAt)
        }
      }
    })

    return items
  })

  const totalCount = computed(() => filteredItems.value.length)
  const totalPages = computed(() => {
    const safePageSize = Math.max(1, params.pageSize.value)
    return totalCount.value === 0 ? 0 : Math.ceil(totalCount.value / safePageSize)
  })

  const currentPage = computed(() => {
    if (totalPages.value === 0) {
      return 1
    }

    return Math.min(Math.max(1, params.page.value), totalPages.value)
  })

  const pagedItems = computed<CarListing[]>(() => {
    if (totalCount.value === 0) {
      return []
    }

    const safePageSize = Math.max(1, params.pageSize.value)
    const start = (currentPage.value - 1) * safePageSize
    return sortedItems.value.slice(start, start + safePageSize)
  })

  const isEmpty = computed(() => totalCount.value === 0)
  const favoritesCount = computed(() => params.favorites.value.size)

  function isFavorite(listingId: string): boolean {
    return params.favorites.value.has(listingId)
  }

  function toggleFavorite(listingId: string): void {
    const next = new Set(params.favorites.value)
    if (next.has(listingId)) {
      next.delete(listingId)
    } else {
      next.add(listingId)
    }

    params.favorites.value = next
  }

  return {
    filteredItems,
    pagedItems,
    totalCount,
    totalPages,
    isEmpty,
    currentPage,
    favoritesCount,
    isFavorite,
    toggleFavorite
  }
}
