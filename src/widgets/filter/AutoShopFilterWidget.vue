<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useFilterUrlSync } from '@/widgets/filter/composables/useFilterUrlSync'
import { useFilterState } from '@/widgets/filter/composables/useFilterState'
import ResultsPanel from './results/ResultsPanel.vue'
import FilterAccordionPanel from './components/FilterAccordionPanel.vue'
import ExtrasDialog from './components/ExtrasDialog.vue'
import GuidedSearchDialog from './components/GuidedSearchDialog.vue'
import type {
  FilterState,
  MultiFilterDefinition,
  RangeFilterDefinition,
  SingleFilterDefinition
} from '@/widgets/filter/types/filters'
import type { SortKey } from './results/types'

const props = defineProps<{
  hostElement?: HTMLElement | null
  resultsChildSelector?: string
}>()

const filter = useFilterState()
const state = filter.state

const {
  appliedFilters,
  rateViewOptions,
  budgetDefinition,
  budgetSingleDefinitions,
  budgetMultiDefinitions,
  vehicleSingleDefinitions,
  vehicleMultiDefinitions,
  vehicleRangeDefinitions,
  extrasSingleDefinitions,
  extrasDefinition,
  yearOptions,
  kilometerOptions,
  powerOptions,
  displacementOptions,
  yearToOptions,
  kilometerToOptions,
  powerToOptions,
  displacementToOptions,
  isKilometerToDisabled,
  createSnapshot,
  applySnapshot,
  getYearToOptionsFor,
  getKilometerToOptionsFor,
  getPowerToOptionsFor,
  getDisplacementToOptionsFor,
  isKilometerToDisabledFor,
  getMultiValue,
  setMultiValue,
  getSingleValue,
  setSingleValue,
  getRangeValue,
  setRangeValue,
  setRateView,
  clearDefinition,
  clearAllFilters,
  removeAppliedFilter,
  setMinPrice,
  setMaxPrice,
  handlePriceKeydown,
  handlePricePaste
} = filter

if (!budgetDefinition.value) {
  throw new Error('Missing price filter definition: budget')
}

const budgetFilterDefinition = budgetDefinition.value

function requireSingleDefinition(
  definitions: SingleFilterDefinition[],
  id: SingleFilterDefinition['id']
): SingleFilterDefinition {
  const definition = definitions.find((item) => item.id === id)
  if (definition) {
    return definition
  }

  const fallback = definitions[0]
  if (!fallback) {
    throw new Error(`Missing single filter definition: ${id}`)
  }

  console.warn(`[AutoShopFilterWidget] Missing single filter definition: ${id}`)
  return fallback
}

function requireRangeDefinition(
  definitions: RangeFilterDefinition[],
  id: RangeFilterDefinition['id']
): RangeFilterDefinition {
  const definition = definitions.find((item) => item.id === id)
  if (definition) {
    return definition
  }

  const fallback = definitions[0]
  if (!fallback) {
    throw new Error(`Missing range filter definition: ${id}`)
  }

  console.warn(`[AutoShopFilterWidget] Missing range filter definition: ${id}`)
  return fallback
}

function requireMultiDefinition(
  definitions: MultiFilterDefinition[],
  id: MultiFilterDefinition['id']
): MultiFilterDefinition {
  const definition = definitions.find((item) => item.id === id)
  if (definition) {
    return definition
  }

  const fallback = definitions[0]
  if (!fallback) {
    throw new Error(`Missing multi filter definition: ${id}`)
  }

  console.warn(`[AutoShopFilterWidget] Missing multi filter definition: ${id}`)
  return fallback
}

const categoryDefinition = requireSingleDefinition(
  vehicleSingleDefinitions.value,
  'category'
)
const locationDefinition = requireSingleDefinition(
  budgetSingleDefinitions.value,
  'location'
)
const radiusDefinition = requireSingleDefinition(
  budgetSingleDefinitions.value,
  'radius'
)
const transmissionDefinition = requireSingleDefinition(
  vehicleSingleDefinitions.value,
  'transmission'
)
const conditionDefinition = requireSingleDefinition(
  vehicleSingleDefinitions.value,
  'condition'
)
const yearDefinition = requireRangeDefinition(
  vehicleRangeDefinitions.value,
  'year'
)
const kilometerDefinition = requireRangeDefinition(
  vehicleRangeDefinitions.value,
  'kilometer'
)
const powerDefinition = requireRangeDefinition(
  vehicleRangeDefinitions.value,
  'power'
)
const displacementDefinition = requireRangeDefinition(
  vehicleRangeDefinitions.value,
  'displacement'
)
const doorsDefinition = requireSingleDefinition(
  extrasSingleDefinitions.value,
  'doors'
)
const seatsDefinition = requireSingleDefinition(
  extrasSingleDefinitions.value,
  'seats'
)
const financingDefinition = requireMultiDefinition(
  budgetMultiDefinitions.value,
  'financing'
)
const markeDefinition = requireMultiDefinition(
  vehicleMultiDefinitions.value,
  'marke'
)
const modelDefinition = requireMultiDefinition(
  vehicleMultiDefinitions.value,
  'model'
)
const bodyTypeDefinition = requireMultiDefinition(
  vehicleMultiDefinitions.value,
  'bodyType'
)
const fuelDefinition = requireMultiDefinition(
  vehicleMultiDefinitions.value,
  'fuel'
)
const extrasMultiDefinition = requireMultiDefinition(
  extrasDefinition.value ? [extrasDefinition.value] : [],
  'extras'
)

const isExtrasDialogOpen = ref(false)
const isGuidedSearchOpen = ref(false)
const extrasSearch = ref('')
const aiSearchQuery = ref('')
const resultsPage = ref(1)
const resultsRefreshToken = ref(0)
const resultsSortKey = ref<SortKey>('relevance')

const filteredExtraOptions = computed(() => {
  const searchTerm = extrasSearch.value.trim().toLowerCase()
  if (!searchTerm) {
    return extrasMultiDefinition.options
  }

  return extrasMultiDefinition.options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm)
  )
})

const isAiSearchDisabled = computed(
  () => aiSearchQuery.value.trim().length === 0
)

interface SearchRequestedDetail {
  source: 'guided-search' | 'results-page' | 'results-sort' | 'saved-search'
  query: string
  sort: SortKey
  page: number
  refreshToken: number
  state: FilterState
}
const { buildQueryFromState } = useFilterUrlSync({
  createSnapshot,
  applySnapshot
})

function resetPaginationAndRefresh(): void {
  resultsPage.value = 1
  resultsRefreshToken.value += 1
}

function applyGuidedSearch(nextState: FilterState): void {
  applySnapshot(nextState)
  resetPaginationAndRefresh()
  dispatchSearchRequested('guided-search')
}

function runAiSearch(): void {
  if (isAiSearchDisabled.value) {
    return
  }

  props.hostElement?.dispatchEvent(
    new CustomEvent<{ query: string }>('ai-search', {
      detail: { query: aiSearchQuery.value.trim() },
      bubbles: true
    })
  )
}

function dispatchSearchRequested(
  source: SearchRequestedDetail['source']
): void {
  const snapshot = createSnapshot()
  const detail: SearchRequestedDetail = {
    source,
    query: buildQueryFromState(snapshot),
    sort: resultsSortKey.value,
    page: resultsPage.value,
    refreshToken: resultsRefreshToken.value,
    state: snapshot
  }

  props.hostElement?.dispatchEvent(
    new CustomEvent<SearchRequestedDetail>('search-requested', {
      detail,
      bubbles: true
    })
  )
}

function handleResultsPageChange(page: number): void {
  resultsPage.value = page
  dispatchSearchRequested('results-page')
}

function handleResultsSortChange(sort: SortKey): void {
  resultsSortKey.value = sort
  resultsPage.value = 1
  resultsRefreshToken.value += 1
  dispatchSearchRequested('results-sort')
}

function handleResultsFavoriteChange(count: number): void {
  props.hostElement?.dispatchEvent(
    new CustomEvent<{ count: number }>('results-favorite-change', {
      detail: { count },
      bubbles: true
    })
  )
}

function handleApplySavedSearch(payload: {
  filters: FilterState
  sortKey: SortKey
}): void {
  resultsSortKey.value = payload.sortKey
  applySnapshot(payload.filters)
  resultsPage.value = 1
  resultsRefreshToken.value += 1
  dispatchSearchRequested('saved-search')
}
</script>

<template>
  <Card class="border-[#c8d2de] bg-[#f7f9fc] shadow-none">
    <CardContent class="p-4 pt-0">
      <div
        class="mx-auto grid w-full max-w-[1320px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
      >
        <FilterAccordionPanel
          :state="state"
          :rate-view-options="rateViewOptions"
          :budget-definition="budgetFilterDefinition"
          :category-definition="categoryDefinition"
          :marke-definition="markeDefinition"
          :model-definition="modelDefinition"
          :year-definition="yearDefinition"
          :kilometer-definition="kilometerDefinition"
          :power-definition="powerDefinition"
          :displacement-definition="displacementDefinition"
          :condition-definition="conditionDefinition"
          :fuel-definition="fuelDefinition"
          :transmission-definition="transmissionDefinition"
          :year-options="yearOptions"
          :kilometer-options="kilometerOptions"
          :power-options="powerOptions"
          :displacement-options="displacementOptions"
          :year-to-options="yearToOptions"
          :kilometer-to-options="kilometerToOptions"
          :power-to-options="powerToOptions"
          :displacement-to-options="displacementToOptions"
          :is-kilometer-to-disabled="isKilometerToDisabled"
          :get-multi-value="getMultiValue"
          :set-multi-value="setMultiValue"
          :get-single-value="getSingleValue"
          :set-single-value="setSingleValue"
          :get-range-value="getRangeValue"
          :set-range-value="setRangeValue"
          :set-rate-view="setRateView"
          :clear-definition="clearDefinition"
          :clear-all-filters="clearAllFilters"
          :set-min-price="setMinPrice"
          :set-max-price="setMaxPrice"
          :handle-price-keydown="handlePriceKeydown"
          :handle-price-paste="handlePricePaste"
          @open-extras="isExtrasDialogOpen = true"
        />

        <div class="min-w-0 space-y-3">
          <Card
            class="border-[#c8d2de] bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_100%)] shadow-none"
          >
            <CardContent class="space-y-3 p-3 sm:p-4">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="space-y-0.5">
                  <p class="text-sm font-semibold text-[#243349]">
                    Smart Suche
                  </p>
                  <p class="text-xs text-[#5f7492]">
                    Beschreibe dein Wunschauto und starte die Suche.
                  </p>
                </div>
                <Button
                  variant="outline"
                  class="h-9 rounded-xl border-[#ced9e8] bg-white text-[#295ea8] hover:bg-[#eef4ff]"
                  @click="isGuidedSearchOpen = true"
                >
                  Geführte Suche starten
                </Button>
              </div>

              <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  placeholder="Beschreibe dein Traumauto..."
                  class="h-11 w-full border-[#cfdaea] bg-white"
                  :model-value="aiSearchQuery"
                  @update:model-value="
                    (value) => (aiSearchQuery = String(value))
                  "
                />
                <Button
                  class="h-11 rounded-xl bg-[#3f82f6] px-6 text-[16px] font-semibold text-white hover:bg-[#2d72e8] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#3f82f6]"
                  :disabled="isAiSearchDisabled"
                  @click="runAiSearch"
                >
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
          <ResultsPanel
            :filter-state="state"
            :applied-filters="appliedFilters"
            :on-clear-all="clearAllFilters"
            :on-remove-filter="removeAppliedFilter"
            @page-change="handleResultsPageChange"
            @sort-change="handleResultsSortChange"
            @favorite-change="handleResultsFavoriteChange"
            @apply-saved-search="handleApplySavedSearch"
          />
        </div>
      </div>
    </CardContent>
  </Card>

  <ExtrasDialog
    :open="isExtrasDialogOpen"
    :doors-value="state.doors"
    :seats-value="state.seats"
    :extras-value="state.extras"
    :search-value="extrasSearch"
    :door-options="doorsDefinition.options"
    :seat-options="seatsDefinition.options"
    :extra-options="extrasMultiDefinition.options"
    :filtered-extra-options="filteredExtraOptions"
    @update:open="(value) => (isExtrasDialogOpen = value)"
    @update:doors-value="(value) => setSingleValue('doors', value)"
    @update:seats-value="(value) => setSingleValue('seats', value)"
    @update:extras-value="(value) => setMultiValue('extras', value)"
    @update:search-value="(value) => (extrasSearch = value)"
  />

  <GuidedSearchDialog
    :open="isGuidedSearchOpen"
    :initial-state="createSnapshot()"
    :definitions="{
      budget: budgetFilterDefinition,
      financing: financingDefinition,
      location: locationDefinition,
      radius: radiusDefinition,
      category: categoryDefinition,
      marke: markeDefinition,
      model: modelDefinition,
      year: yearDefinition,
      kilometer: kilometerDefinition,
      power: powerDefinition,
      displacement: displacementDefinition,
      fuel: fuelDefinition,
      transmission: transmissionDefinition,
      bodyType: bodyTypeDefinition,
      condition: conditionDefinition,
      doors: doorsDefinition,
      seats: seatsDefinition,
      extras: extrasMultiDefinition
    }"
    :year-options="yearOptions"
    :kilometer-options="kilometerOptions"
    :power-options="powerOptions"
    :displacement-options="displacementOptions"
    :get-year-to-options-for="getYearToOptionsFor"
    :get-kilometer-to-options-for="getKilometerToOptionsFor"
    :get-power-to-options-for="getPowerToOptionsFor"
    :get-displacement-to-options-for="getDisplacementToOptionsFor"
    :is-kilometer-to-disabled-for="isKilometerToDisabledFor"
    @update:open="(value) => (isGuidedSearchOpen = value)"
    @apply="applyGuidedSearch"
  />
</template>
