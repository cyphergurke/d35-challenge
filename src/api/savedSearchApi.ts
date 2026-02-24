import {
  cloneSavedSearchQuery,
  type SavedSearch,
  type SavedSearchCreateInput,
  type SavedSearchUpdateInput
} from '@/widgets/filter/results/searchModels'

const API_DELAY_MS = 180

const savedSearchStore: SavedSearch[] = []

function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, API_DELAY_MS)
  })
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function cloneSavedSearch(savedSearch: SavedSearch): SavedSearch {
  return {
    id: savedSearch.id,
    name: savedSearch.name,
    query: cloneSavedSearchQuery(savedSearch.query),
    createdAt: savedSearch.createdAt,
    updatedAt: savedSearch.updatedAt
  }
}

function findSavedSearchIndex(savedSearchId: string): number {
  return savedSearchStore.findIndex((entry) => entry.id === savedSearchId)
}

function getNowIso(): string {
  return new Date().toISOString()
}

function sanitizeName(name: string): string {
  const trimmed = name.trim()
  return trimmed || 'Neue Suche'
}

export async function createSavedSearch(input: SavedSearchCreateInput): Promise<SavedSearch> {
  await delay()

  const now = getNowIso()
  const nextEntry: SavedSearch = {
    id: createId('saved-search'),
    name: sanitizeName(input.name),
    query: cloneSavedSearchQuery(input.query),
    createdAt: now,
    updatedAt: now
  }

  savedSearchStore.unshift(nextEntry)

  return cloneSavedSearch(nextEntry)
}

export async function updateSavedSearch(
  savedSearchId: string,
  input: SavedSearchUpdateInput
): Promise<SavedSearch> {
  await delay()

  const entryIndex = findSavedSearchIndex(savedSearchId)
  if (entryIndex < 0) {
    throw new Error(`Saved search not found: ${savedSearchId}`)
  }

  const previousEntry = savedSearchStore[entryIndex]
  if (!previousEntry) {
    throw new Error(`Saved search not found: ${savedSearchId}`)
  }

  const nextEntry: SavedSearch = {
    ...previousEntry,
    name: input.name !== undefined ? sanitizeName(input.name) : previousEntry.name,
    query: input.query ? cloneSavedSearchQuery(input.query) : previousEntry.query,
    updatedAt: getNowIso()
  }

  savedSearchStore[entryIndex] = nextEntry

  return cloneSavedSearch(nextEntry)
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  await delay()

  const sorted = [...savedSearchStore].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  )
  return sorted.map(cloneSavedSearch)
}

export async function deleteSavedSearch(savedSearchId: string): Promise<void> {
  await delay()

  const entryIndex = findSavedSearchIndex(savedSearchId)
  if (entryIndex < 0) {
    throw new Error(`Saved search not found: ${savedSearchId}`)
  }

  savedSearchStore.splice(entryIndex, 1)
}
