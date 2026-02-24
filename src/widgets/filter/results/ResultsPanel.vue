<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import AppliedFiltersRow from '@/widgets/filter/results/AppliedFiltersRow.vue'
import ResultsGrid from '@/widgets/filter/results/ResultsGrid.vue'
import SearchManagementDialog from '@/widgets/filter/results/SearchManagementDialog.vue'
import ResultsToolbar from '@/widgets/filter/results/ResultsToolbar.vue'
import { buildAppliedFiltersFromState } from '@/widgets/filter/results/buildAppliedFilters'
import { cloneFilterState } from '@/widgets/filter/results/searchModels'
import { useResults } from '@/widgets/filter/results/useResults'
import { RESULT_SORT_OPTIONS, type SortKey } from '@/widgets/filter/results/types'
import type { AppliedFilter, FilterState } from '@/widgets/filter/types/filters'

interface Props {
  filterState: FilterState
  appliedFilters?: AppliedFilter[]
  onClearAll: () => void
  onRemoveFilter: (filter: AppliedFilter) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'page-change', page: number): void
  (event: 'sort-change', sort: SortKey): void
  (event: 'favorite-change', count: number): void
  (event: 'apply-saved-search', payload: { filters: FilterState; sortKey: SortKey }): void
}>()

const sortKey = ref<SortKey>('relevance')
const page = ref(1)
const pageSize = ref(12)
const favorites = ref<Set<string>>(new Set())
const isSearchDialogOpen = ref(false)
const pageSizeOptions = [6, 9, 12, 15, 18, 21, 24] as const
const defaultPageSizeOption = pageSizeOptions[0]
const maxPageSizeOption = pageSizeOptions[pageSizeOptions.length - 1] ?? defaultPageSizeOption
const isLoading = ref(false)
const loadingDelayMs = 700
let loadingTimer: number | null = null
const FAVORITES_STORAGE_KEY = 'd35-results-favorites'

interface SearchDialogExposed {
  openAlertsTab: () => void
  saveCurrentSearchFromToolbar: () => Promise<void>
}

const searchDialogRef = ref<SearchDialogExposed | null>(null)

const {
  pagedItems,
  totalCount,
  totalPages,
  isEmpty,
  currentPage,
  favoritesCount,
  isFavorite,
  toggleFavorite
} = useResults({
  filterState: props.filterState,
  sortKey,
  page,
  pageSize,
  favorites
})

const resolvedAppliedFilters = computed<AppliedFilter[]>(() => {
  if (props.appliedFilters) {
    return props.appliedFilters
  }

  return buildAppliedFiltersFromState(props.filterState)
})

function readFavoritesFromStorage(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set()
  }

  const serialized = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
  if (!serialized) {
    return new Set()
  }

  try {
    const parsed: unknown = JSON.parse(serialized)
    if (!Array.isArray(parsed)) {
      return new Set()
    }

    const values = parsed.filter((value): value is string => typeof value === 'string')
    return new Set(values)
  } catch {
    return new Set()
  }
}

function persistFavoritesToStorage(nextFavorites: Set<string>): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(Array.from(nextFavorites))
  )
}

async function handleSaveSearch(): Promise<void> {
  await searchDialogRef.value?.saveCurrentSearchFromToolbar()
}

function openSearchAlertDialog(): void {
  isSearchDialogOpen.value = true
  searchDialogRef.value?.openAlertsTab()
}

function handleApplySavedSearch(payload: { filters: FilterState; sortKey: SortKey }): void {
  sortKey.value = payload.sortKey
  page.value = 1

  emit('apply-saved-search', {
    filters: cloneFilterState(payload.filters),
    sortKey: payload.sortKey
  })
}

if (typeof window !== 'undefined') {
  favorites.value = readFavoritesFromStorage()
}

const resultRangeText = computed(() => {
  if (totalCount.value === 0) {
    return '0 Ergebnisse'
  }

  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(start + pageSize.value - 1, totalCount.value)
  return `${start}-${end} von ${totalCount.value} Ergebnissen`
})

const visiblePages = computed<Array<number | 'ellipsis-left' | 'ellipsis-right'>>(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, index) => index + 1)
  }

  if (currentPage.value <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages.value]
  }

  if (currentPage.value >= totalPages.value - 3) {
    return [
      1,
      'ellipsis-left',
      totalPages.value - 4,
      totalPages.value - 3,
      totalPages.value - 2,
      totalPages.value - 1,
      totalPages.value
    ]
  }

  return [
    1,
    'ellipsis-left',
    currentPage.value - 1,
    currentPage.value,
    currentPage.value + 1,
    'ellipsis-right',
    totalPages.value
  ]
})

watch(
  () => props.filterState,
  () => {
    page.value = 1
  },
  { deep: true }
)

watch(sortKey, (value) => {
  page.value = 1
  emit('sort-change', value)
})

watch(pageSize, (value) => {
  if (value <= 0 || value % 3 !== 0) {
    const fallback =
      value <= 0
        ? defaultPageSizeOption
        : pageSizeOptions.find((option) => option >= value) ??
          maxPageSizeOption
    pageSize.value = fallback
    return
  }

  page.value = 1
})

watch(
  currentPage,
  (value) => {
    emit('page-change', value)
  },
  { immediate: true }
)

watch(
  favoritesCount,
  (value) => {
    emit('favorite-change', value)
  },
  { immediate: true }
)

watch(favorites, (value) => {
  persistFavoritesToStorage(value)
})

watch(
  [() => props.filterState, sortKey, page, pageSize],
  () => {
    if (loadingTimer !== null) {
      window.clearTimeout(loadingTimer)
      loadingTimer = null
    }

    isLoading.value = true
    loadingTimer = window.setTimeout(() => {
      isLoading.value = false
      loadingTimer = null
    }, loadingDelayMs)
  },
  { immediate: true, deep: true }
)

onBeforeUnmount(() => {
  if (loadingTimer === null) {
    return
  }

  window.clearTimeout(loadingTimer)
  loadingTimer = null
})

function setPage(nextPage: number): void {
  if (totalPages.value === 0) {
    page.value = 1
    return
  }

  const clampedPage = Math.min(Math.max(nextPage, 1), totalPages.value)
  page.value = clampedPage
}

function previousPage(): void {
  setPage(currentPage.value - 1)
}

function nextPage(): void {
  setPage(currentPage.value + 1)
}
</script>

<template>
  <section class="space-y-3">
    <div class="rounded-2xl border border-[#c8d2de] bg-white p-3">
      <ResultsToolbar
        v-model:sort-key="sortKey"
        v-model:page-size="pageSize"
        :sort-options="RESULT_SORT_OPTIONS"
        :favorites-count="favoritesCount"
        :total-count="totalCount"
        :page-size-options="pageSizeOptions"
        @open-search-alert="openSearchAlertDialog"
        @save-search="handleSaveSearch"
      />

      <AppliedFiltersRow
        :applied-filters="resolvedAppliedFilters"
        :on-clear-all="onClearAll"
        :on-remove-filter="onRemoveFilter"
      />
    </div>

    <div class="rounded-2xl border border-[#c8d2de] bg-[#f7f9fc] p-3">
      <div class="mb-3 flex items-center justify-between text-xs text-[#6d809b]">
        <p>{{ resultRangeText }}</p>
        <p>Seite {{ currentPage }} / {{ Math.max(totalPages, 1) }}</p>
      </div>

      <div
        v-if="isLoading"
        class="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-[#c6d4e7] bg-white px-4 text-center text-sm text-[#68809f]"
      >
        <div class="inline-flex items-center gap-2 rounded-full border border-[#d6dfeb] bg-[#f8fafd] px-3 py-2">
          <Spinner class="size-4 text-[#5b7396]" />
          <span>Lade Ergebnisse...</span>
        </div>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-[#c6d4e7] bg-white px-4 text-center text-sm text-[#68809f]"
      >
        Keine Ergebnisse fuer die aktuelle Filterkombination gefunden.
      </div>

      <ResultsGrid
        v-else
        :listings="pagedItems"
        :is-favorite="isFavorite"
        @toggle-favorite="toggleFavorite"
      />

      <div
        v-if="totalPages > 1"
        class="mt-4 flex flex-wrap items-center justify-center gap-1"
      >
        <Button
          variant="outline"
          size="sm"
          class="h-8 rounded-lg"
          :disabled="currentPage <= 1"
          @click="previousPage"
        >
          <ChevronLeft class="size-4" />
        </Button>

        <template
          v-for="entry in visiblePages"
          :key="`page-${entry}`"
        >
          <Button
            v-if="typeof entry === 'number'"
            :variant="entry === currentPage ? 'default' : 'ghost'"
            size="sm"
            class="h-8 min-w-8 rounded-lg"
            @click="setPage(entry)"
          >
            {{ entry }}
          </Button>
          <span
            v-else
            class="px-1 text-sm text-[#7990ad]"
          >
            ...
          </span>
        </template>

        <Button
          variant="outline"
          size="sm"
          class="h-8 rounded-lg"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </div>

    <SearchManagementDialog
      ref="searchDialogRef"
      v-model:open="isSearchDialogOpen"
      :current-filters="filterState"
      :current-sort-key="sortKey"
      @apply-saved-search="handleApplySavedSearch"
    />
  </section>
</template>
