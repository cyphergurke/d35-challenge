import {
  type SearchAlert,
  type SearchAlertCreateInput,
  type SearchAlertUpdateInput
} from '@/widgets/filter/results/searchModels'

const API_DELAY_MS = 180

const searchAlertStore: SearchAlert[] = []

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

function cloneSearchAlert(searchAlert: SearchAlert): SearchAlert {
  return {
    ...searchAlert,
    quietHours: searchAlert.quietHours
      ? {
          start: searchAlert.quietHours.start,
          end: searchAlert.quietHours.end,
          timezone: searchAlert.quietHours.timezone
        }
      : undefined
  }
}

function findSearchAlertIndex(searchAlertId: string): number {
  return searchAlertStore.findIndex((entry) => entry.id === searchAlertId)
}

function getNowIso(): string {
  return new Date().toISOString()
}

export async function createSearchAlert(input: SearchAlertCreateInput): Promise<SearchAlert> {
  await delay()

  const now = getNowIso()
  const nextEntry: SearchAlert = {
    id: createId('search-alert'),
    savedSearchId: input.savedSearchId,
    isActive: input.isActive,
    channel: input.channel,
    target: input.target.trim(),
    frequency: input.frequency,
    onlyOnNew: input.onlyOnNew,
    dedupeSeen: input.dedupeSeen,
    quietHours: input.quietHours
      ? {
          start: input.quietHours.start,
          end: input.quietHours.end,
          timezone: input.quietHours.timezone
        }
      : undefined,
    createdAt: now,
    updatedAt: now
  }

  searchAlertStore.unshift(nextEntry)

  return cloneSearchAlert(nextEntry)
}

export async function updateSearchAlert(
  searchAlertId: string,
  input: SearchAlertUpdateInput
): Promise<SearchAlert> {
  await delay()

  const entryIndex = findSearchAlertIndex(searchAlertId)
  if (entryIndex < 0) {
    throw new Error(`Search alert not found: ${searchAlertId}`)
  }

  const previousEntry = searchAlertStore[entryIndex]
  if (!previousEntry) {
    throw new Error(`Search alert not found: ${searchAlertId}`)
  }

  const nextEntry: SearchAlert = {
    ...previousEntry,
    savedSearchId: input.savedSearchId ?? previousEntry.savedSearchId,
    isActive: input.isActive ?? previousEntry.isActive,
    channel: input.channel ?? previousEntry.channel,
    target: input.target !== undefined ? input.target.trim() : previousEntry.target,
    frequency: input.frequency ?? previousEntry.frequency,
    onlyOnNew: input.onlyOnNew ?? previousEntry.onlyOnNew,
    dedupeSeen: input.dedupeSeen ?? previousEntry.dedupeSeen,
    quietHours:
      input.quietHours === undefined
        ? previousEntry.quietHours
        : input.quietHours === null
          ? undefined
          : {
              start: input.quietHours.start,
              end: input.quietHours.end,
              timezone: input.quietHours.timezone
            },
    lastNotifiedAt: input.lastNotifiedAt ?? previousEntry.lastNotifiedAt,
    updatedAt: getNowIso()
  }

  searchAlertStore[entryIndex] = nextEntry

  return cloneSearchAlert(nextEntry)
}

export async function listSearchAlerts(): Promise<SearchAlert[]> {
  await delay()

  const sorted = [...searchAlertStore].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  )
  return sorted.map(cloneSearchAlert)
}

export async function deleteSearchAlert(searchAlertId: string): Promise<void> {
  await delay()

  const entryIndex = findSearchAlertIndex(searchAlertId)
  if (entryIndex < 0) {
    throw new Error(`Search alert not found: ${searchAlertId}`)
  }

  searchAlertStore.splice(entryIndex, 1)
}

export async function sendSearchAlertTest(searchAlertId: string): Promise<SearchAlert> {
  await delay()

  return updateSearchAlert(searchAlertId, { lastNotifiedAt: getNowIso() })
}
