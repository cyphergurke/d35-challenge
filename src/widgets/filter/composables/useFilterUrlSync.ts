import { watch } from 'vue'
import type {
  FilterState,
  MultiFilterStateKey,
  RangeFromStateKey,
  RangeToStateKey,
  SingleFilterStateKey
} from '@/widgets/filter/types/filters'
import { cloneFilterState } from '@/widgets/filter/utils/filterState'

type UrlSingleFilterStateKey =
  | SingleFilterStateKey
  | RangeFromStateKey
  | RangeToStateKey
  | 'minPrice'
  | 'maxPrice'

type QueryMappingEntry =
  | { stateKey: UrlSingleFilterStateKey; queryKey: string; kind: 'single' }
  | { stateKey: MultiFilterStateKey; queryKey: string; kind: 'multi' }

const FILTER_QUERY_MAP = [
  { stateKey: 'category', queryKey: 'category', kind: 'single' },
  { stateKey: 'location', queryKey: 'location', kind: 'single' },
  { stateKey: 'radius', queryKey: 'radius', kind: 'single' },
  { stateKey: 'marke', queryKey: 'marke', kind: 'multi' },
  { stateKey: 'model', queryKey: 'model', kind: 'multi' },
  { stateKey: 'bodyType', queryKey: 'bodyType', kind: 'multi' },
  { stateKey: 'fuel', queryKey: 'fuel', kind: 'multi' },
  { stateKey: 'financing', queryKey: 'financing', kind: 'multi' },
  { stateKey: 'transmission', queryKey: 'transmission', kind: 'single' },
  { stateKey: 'condition', queryKey: 'condition', kind: 'single' },
  { stateKey: 'yearFrom', queryKey: 'yearFrom', kind: 'single' },
  { stateKey: 'yearTo', queryKey: 'yearTo', kind: 'single' },
  { stateKey: 'kilometerFrom', queryKey: 'kilometerFrom', kind: 'single' },
  { stateKey: 'kilometerTo', queryKey: 'kilometerTo', kind: 'single' },
  { stateKey: 'powerFrom', queryKey: 'powerFrom', kind: 'single' },
  { stateKey: 'powerTo', queryKey: 'powerTo', kind: 'single' },
  {
    stateKey: 'displacementFrom',
    queryKey: 'displacementFrom',
    kind: 'single'
  },
  { stateKey: 'displacementTo', queryKey: 'displacementTo', kind: 'single' },
  { stateKey: 'minPrice', queryKey: 'minPrice', kind: 'single' },
  { stateKey: 'maxPrice', queryKey: 'maxPrice', kind: 'single' },
  { stateKey: 'doors', queryKey: 'doors', kind: 'single' },
  { stateKey: 'seats', queryKey: 'seats', kind: 'single' },
  { stateKey: 'extras', queryKey: 'extras', kind: 'multi' }
] as const satisfies readonly QueryMappingEntry[]

const FILTER_QUERY_KEYS = Array.from(
  new Set(FILTER_QUERY_MAP.map((entry) => entry.queryKey))
)

function parseSingleParam(
  searchParams: URLSearchParams,
  key: string
): string | undefined {
  if (!searchParams.has(key)) {
    return undefined
  }

  const rawValue = searchParams.get(key)
  if (rawValue === null) {
    return undefined
  }

  const normalizedValue = rawValue.trim()
  return normalizedValue.length > 0 ? normalizedValue : undefined
}

function parseMultiParam(searchParams: URLSearchParams, key: string): string[] {
  const values = searchParams
    .getAll(key)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

  if (values.length !== 1) {
    return values
  }

  if (!values[0]?.includes(',')) {
    return values
  }

  return values[0]
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

function setSingleStateValue<K extends UrlSingleFilterStateKey>(
  state: FilterState,
  key: K,
  value: string | undefined
): void {
  if (value === undefined) {
    return
  }

  state[key] = value as FilterState[K]
}

function setMultiStateValue<K extends MultiFilterStateKey>(
  state: FilterState,
  key: K,
  value: string[]
): void {
  state[key] = value as FilterState[K]
}

function hasAnyMappedFilterValue(nextState: FilterState): boolean {
  for (const entry of FILTER_QUERY_MAP) {
    if (entry.kind === 'single') {
      const value = nextState[entry.stateKey]
      if (typeof value === 'string' && value.trim().length > 0) {
        return true
      }

      continue
    }

    if (nextState[entry.stateKey].length > 0) {
      return true
    }
  }

  return false
}

function buildQueryFromState(nextState: FilterState): string {
  const searchParams = new URLSearchParams()

  for (const entry of FILTER_QUERY_MAP) {
    if (entry.kind === 'single') {
      const value = nextState[entry.stateKey]
      if (typeof value === 'string' && value.trim().length > 0) {
        searchParams.set(entry.queryKey, value.trim())
      }

      continue
    }

    for (const item of nextState[entry.stateKey]) {
      const normalizedItem = item.trim()
      if (!normalizedItem) {
        continue
      }

      searchParams.append(entry.queryKey, normalizedItem)
    }
  }

  return searchParams.toString()
}

function parseStateFromUri(baseState: FilterState): FilterState | null {
  if (typeof window === 'undefined') {
    return null
  }

  const searchParams = new URL(window.location.href).searchParams
  const hasMappedQueryKey = FILTER_QUERY_KEYS.some((key) =>
    searchParams.has(key)
  )
  if (!hasMappedQueryKey) {
    return null
  }

  const nextState = cloneFilterState(baseState)

  for (const entry of FILTER_QUERY_MAP) {
    if (entry.kind === 'single') {
      setSingleStateValue(
        nextState,
        entry.stateKey,
        parseSingleParam(searchParams, entry.queryKey)
      )
      continue
    }

    setMultiStateValue(
      nextState,
      entry.stateKey,
      parseMultiParam(searchParams, entry.queryKey)
    )
  }

  return hasAnyMappedFilterValue(nextState) ? nextState : null
}

function syncFilterParamsToUri(query: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const nextUrl = new URL(window.location.href)

  for (const key of FILTER_QUERY_KEYS) {
    nextUrl.searchParams.delete(key)
  }
  // Drop legacy UI-only search input if present.
  nextUrl.searchParams.delete('extrasSearch')

  // Drop legacy duplicated query payload if present.
  nextUrl.searchParams.delete('carQueryParams')

  if (query) {
    const filterParams = new URLSearchParams(query)
    for (const [key, value] of filterParams.entries()) {
      nextUrl.searchParams.append(key, value)
    }
  }

  const currentPathWithQuery = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const nextPathWithQuery = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  if (currentPathWithQuery === nextPathWithQuery) {
    return
  }

  window.history.replaceState(window.history.state, '', nextPathWithQuery)
}

interface UseFilterUrlSyncParams {
  createSnapshot: () => FilterState
  applySnapshot: (nextState: FilterState) => void
}

export function useFilterUrlSync(params: UseFilterUrlSyncParams): {
  buildQueryFromState: (nextState: FilterState) => string
  hasAnyFilterValue: (nextState: FilterState) => boolean
} {
  const initialState = params.createSnapshot()
  if (!hasAnyMappedFilterValue(initialState)) {
    const uriState = parseStateFromUri(initialState)
    if (uriState) {
      params.applySnapshot(uriState)
    }
  }

  watch(
    () => buildQueryFromState(params.createSnapshot()),
    (query) => {
      syncFilterParamsToUri(query)
    },
    { immediate: true }
  )

  return {
    buildQueryFromState,
    hasAnyFilterValue: hasAnyMappedFilterValue
  }
}
