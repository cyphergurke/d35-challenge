<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useFilterState } from '@/widgets/filter/composables/useFilterState'
import ResultsPanel from './results/ResultsPanel.vue'
import MultiSelectFilter from './components/MultiSelectFilter.vue'
import PriceRangeFilter from './components/PriceRangeFilter.vue'
import RangeSelectPair from './components/RangeSelectPair.vue'
import SelectFilter from './components/SelectFilter.vue'
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
  filteredExtraOptions,
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
  if (!definition) {
    throw new Error(`Missing single filter definition: ${id}`)
  }

  return definition
}

function requireRangeDefinition(
  definitions: RangeFilterDefinition[],
  id: RangeFilterDefinition['id']
): RangeFilterDefinition {
  const definition = definitions.find((item) => item.id === id)
  if (!definition) {
    throw new Error(`Missing range filter definition: ${id}`)
  }

  return definition
}

function requireMultiDefinition(
  definitions: MultiFilterDefinition[],
  id: MultiFilterDefinition['id']
): MultiFilterDefinition {
  const definition = definitions.find((item) => item.id === id)
  if (!definition) {
    throw new Error(`Missing multi filter definition: ${id}`)
  }

  return definition
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
const aiSearchQuery = ref('')
const resultsPage = ref(1)
const resultsRefreshToken = ref(0)

const extrasSummary = computed(() => {
  if (!state.doors && !state.seats && state.extras.length === 0) {
    return 'Noch keine Extras ausgewaehlt'
  }

  const doorsLabel = state.doors ? `Tueren: ${state.doors}` : 'Tueren: -'
  const seatsLabel = state.seats ? `Sitze: ${state.seats}` : 'Sitze: -'
  return `${doorsLabel} | ${seatsLabel} | ${state.extras.length} Extras gewaehlt`
})

const isAiSearchDisabled = computed(() => aiSearchQuery.value.trim().length === 0)

interface FiltersAppliedDetail {
  query: string
  page: number
  refreshToken: number
  state: FilterState
}

const FILTER_QUERY_PARAM_KEYS = [
  'category',
  'location',
  'radius',
  'marke',
  'model',
  'bodyType',
  'fuel',
  'financing',
  'transmission',
  'condition',
  'yearFrom',
  'yearTo',
  'kilometerFrom',
  'kilometerTo',
  'powerFrom',
  'powerTo',
  'displacementFrom',
  'displacementTo',
  'minPrice',
  'maxPrice',
  'doors',
  'seats',
  'extras',
  'extrasSearch'
] as const

function appendMultiParam(
  searchParams: URLSearchParams,
  key: string,
  value: string[]
): void {
  if (value.length === 0) {
    return
  }

  searchParams.set(key, value.join(','))
}

function appendSingleParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined
): void {
  if (!value) {
    return
  }

  searchParams.set(key, value)
}

function buildQueryFromState(nextState: FilterState): string {
  const searchParams = new URLSearchParams()

  appendSingleParam(searchParams, 'category', nextState.category)
  appendSingleParam(searchParams, 'location', nextState.location)
  appendSingleParam(searchParams, 'radius', nextState.radius)
  appendMultiParam(searchParams, 'marke', nextState.marke)
  appendMultiParam(searchParams, 'model', nextState.model)
  appendMultiParam(searchParams, 'bodyType', nextState.bodyType)
  appendMultiParam(searchParams, 'fuel', nextState.fuel)
  appendMultiParam(searchParams, 'financing', nextState.financing)
  appendSingleParam(searchParams, 'transmission', nextState.transmission)
  appendSingleParam(searchParams, 'condition', nextState.condition)
  appendSingleParam(searchParams, 'yearFrom', nextState.yearFrom)
  appendSingleParam(searchParams, 'yearTo', nextState.yearTo)
  appendSingleParam(searchParams, 'kilometerFrom', nextState.kilometerFrom)
  appendSingleParam(searchParams, 'kilometerTo', nextState.kilometerTo)
  appendSingleParam(searchParams, 'powerFrom', nextState.powerFrom)
  appendSingleParam(searchParams, 'powerTo', nextState.powerTo)
  appendSingleParam(
    searchParams,
    'displacementFrom',
    nextState.displacementFrom
  )
  appendSingleParam(searchParams, 'displacementTo', nextState.displacementTo)
  appendSingleParam(searchParams, 'minPrice', nextState.minPrice)
  appendSingleParam(searchParams, 'maxPrice', nextState.maxPrice)
  appendSingleParam(searchParams, 'doors', nextState.doors)
  appendSingleParam(searchParams, 'seats', nextState.seats)
  appendMultiParam(searchParams, 'extras', nextState.extras)
  appendSingleParam(searchParams, 'extrasSearch', nextState.extrasSearch)

  return searchParams.toString()
}

function syncFilterParamsToUri(query: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const nextUrl = new URL(window.location.href)

  for (const filterKey of FILTER_QUERY_PARAM_KEYS) {
    nextUrl.searchParams.delete(filterKey)
  }
  nextUrl.searchParams.delete('carQueryParams')

  if (query) {
    const filterParams = new URLSearchParams(query)
    filterParams.forEach((value, key) => {
      nextUrl.searchParams.set(key, value)
    })
    nextUrl.searchParams.set('carQueryParams', `&${query}`)
  }

  const currentPathWithQuery = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const nextPathWithQuery = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  if (currentPathWithQuery === nextPathWithQuery) {
    return
  }

  window.history.replaceState(window.history.state, '', nextPathWithQuery)
}

function resetPaginationAndRefresh(): void {
  resultsPage.value = 1
  resultsRefreshToken.value += 1
}

function applyGuidedSearch(nextState: FilterState): void {
  applySnapshot(nextState)
  resetPaginationAndRefresh()

  const detail: FiltersAppliedDetail = {
    query: buildQueryFromState(nextState),
    page: resultsPage.value,
    refreshToken: resultsRefreshToken.value,
    state: createSnapshot()
  }

  props.hostElement?.dispatchEvent(
    new CustomEvent<FiltersAppliedDetail>('filters-applied', {
      detail,
      bubbles: true
    })
  )
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

watch(
  () => buildQueryFromState(createSnapshot()),
  (query) => {
    syncFilterParamsToUri(query)
  },
  { immediate: true }
)

function handleResultsPageChange(page: number): void {
  resultsPage.value = page
  props.hostElement?.dispatchEvent(
    new CustomEvent<{ page: number }>('results-page-change', {
      detail: { page },
      bubbles: true
    })
  )
}

function handleResultsSortChange(sort: SortKey): void {
  resultsPage.value = 1
  resultsRefreshToken.value += 1
  props.hostElement?.dispatchEvent(
    new CustomEvent<{ sort: SortKey }>('results-sort-change', {
      detail: { sort },
      bubbles: true
    })
  )
}

function handleResultsFavoriteChange(count: number): void {
  props.hostElement?.dispatchEvent(
    new CustomEvent<{ count: number }>('results-favorite-change', {
      detail: { count },
      bubbles: true
    })
  )
}
</script>

<template>
  <Card class="border-[#c8d2de] bg-[#f7f9fc] shadow-none">
    <CardHeader class="flex-row items-center justify-between gap-4 p-4">
      <div class="flex w-full items-center gap-2">
        <Input
          placeholder="Beschreibe dein Traumauto..."
          class="h-10 w-full bg-white"
          :model-value="aiSearchQuery"
          @update:model-value="(value) => (aiSearchQuery = String(value))"
        />
        <Button
          class="h-10 w-fit rounded-xl bg-[#3f82f6] px-5 text-[17px] text-white hover:bg-[#2d72e8] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#3f82f6]"
          :disabled="isAiSearchDisabled"
          @click="runAiSearch"
        >
          Search
        </Button>
      </div>
      <Button
        class="h-10 w-fit rounded-xl bg-[#3f82f6] px-5 text-[17px] text-white hover:bg-[#2d72e8]"
        @click="isGuidedSearchOpen = true"
      >
        Start Guided Search
      </Button>
    </CardHeader>

    <CardContent class="p-4 pt-0">
      <div
        class="mx-auto grid w-full max-w-[1320px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
      >
        <Card class="w-full border-[#c8d2de] bg-[#f7f9fc] shadow-none">
          <CardHeader class="p-4">
            <CardTitle
              class="text-[32px] leading-none tracking-[-0.03em] text-[#2a3342]"
              >Filters</CardTitle
            >
          </CardHeader>

          <CardContent class="space-y-4 p-4 pt-0">
            <Card class="border-[#c3cfdd] bg-[#f7f9fc] shadow-none">
              <CardContent class="space-y-3 p-3">
                <PriceRangeFilter
                  :label="budgetFilterDefinition.label"
                  :min-value="state.minPrice"
                  :max-value="state.maxPrice"
                  @update:min-value="setMinPrice"
                  @update:max-value="setMaxPrice"
                  @keydown="handlePriceKeydown"
                  @paste="handlePricePaste"
                  @clear="clearDefinition('budget')"
                />

                <template
                  v-for="definition in budgetSingleDefinitions"
                  :key="definition.id"
                >
                  <Separator class="bg-[#d6dfeb]" />
                  <SelectFilter
                    :label="definition.label"
                    :placeholder="definition.placeholder"
                    :options="definition.options"
                    :model-value="getSingleValue(definition.stateKey)"
                    @update:model-value="
                      (value) => setSingleValue(definition.stateKey, value)
                    "
                  />
                </template>

                <template
                  v-for="(definition, index) in budgetMultiDefinitions"
                  :key="definition.id"
                >
                  <Separator v-if="index >= 0" class="bg-[#d6dfeb]" />
                  <MultiSelectFilter
                    :label="definition.label"
                    :placeholder="definition.placeholder"
                    :empty-text="definition.emptyText"
                    :options="definition.options"
                    :model-value="getMultiValue(definition.stateKey)"
                    :show-chips="definition.showChips ?? true"
                    @update:model-value="
                      (value) => setMultiValue(definition.stateKey, value)
                    "
                  />
                </template>
              </CardContent>
            </Card>

            <Card class="border-[#c3cfdd] bg-[#f7f9fc] shadow-none">
              <CardHeader class="p-3 pb-2">
                <CardTitle
                  class="text-[26px] leading-none tracking-[-0.02em] text-[#2a3342]"
                  >Fahrzeugdetails
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4 p-3 pt-0">
                <SelectFilter
                  :label="categoryDefinition.label"
                  :placeholder="categoryDefinition.placeholder"
                  :options="categoryDefinition.options"
                  :model-value="getSingleValue(categoryDefinition.stateKey)"
                  @update:model-value="
                    (value) =>
                      setSingleValue(categoryDefinition.stateKey, value)
                  "
                />

                <template
                  v-for="definition in vehicleMultiDefinitions"
                  :key="definition.id"
                >
                  <Separator class="bg-[#d6dfeb]" />
                  <MultiSelectFilter
                    :label="definition.label"
                    :placeholder="definition.placeholder"
                    :empty-text="definition.emptyText"
                    :options="definition.options"
                    :model-value="getMultiValue(definition.stateKey)"
                    :show-chips="definition.showChips ?? true"
                    @update:model-value="
                      (value) => setMultiValue(definition.stateKey, value)
                    "
                  />
                </template>

                <Separator class="bg-[#d6dfeb]" />
                <SelectFilter
                  :label="transmissionDefinition.label"
                  :placeholder="transmissionDefinition.placeholder"
                  :options="transmissionDefinition.options"
                  :model-value="getSingleValue(transmissionDefinition.stateKey)"
                  @update:model-value="
                    (value) =>
                      setSingleValue(transmissionDefinition.stateKey, value)
                  "
                />

                <Separator class="bg-[#d6dfeb]" />
                <RangeSelectPair
                  :label="yearDefinition.label"
                  :from-value="state.yearFrom"
                  :to-value="state.yearTo"
                  :from-options="yearOptions"
                  :to-options="yearToOptions"
                  @update:from-value="(value) => (state.yearFrom = value)"
                  @update:to-value="(value) => (state.yearTo = value)"
                  @clear="clearDefinition(yearDefinition.id)"
                />

                <Separator class="bg-[#d6dfeb]" />
                <RangeSelectPair
                  :label="kilometerDefinition.label"
                  :from-value="state.kilometerFrom"
                  :to-value="state.kilometerTo"
                  :from-options="kilometerOptions"
                  :to-options="kilometerToOptions"
                  :to-disabled="isKilometerToDisabled"
                  @update:from-value="(value) => (state.kilometerFrom = value)"
                  @update:to-value="(value) => (state.kilometerTo = value)"
                  @clear="clearDefinition(kilometerDefinition.id)"
                />

                <Separator class="bg-[#d6dfeb]" />
                <RangeSelectPair
                  :label="powerDefinition.label"
                  :from-value="state.powerFrom"
                  :to-value="state.powerTo"
                  :from-options="powerOptions"
                  :to-options="powerToOptions"
                  @update:from-value="(value) => (state.powerFrom = value)"
                  @update:to-value="(value) => (state.powerTo = value)"
                  @clear="clearDefinition(powerDefinition.id)"
                />

                <Separator class="bg-[#d6dfeb]" />
                <RangeSelectPair
                  :label="displacementDefinition.label"
                  :from-value="state.displacementFrom"
                  :to-value="state.displacementTo"
                  :from-options="displacementOptions"
                  :to-options="displacementToOptions"
                  @update:from-value="
                    (value) => (state.displacementFrom = value)
                  "
                  @update:to-value="(value) => (state.displacementTo = value)"
                  @clear="clearDefinition(displacementDefinition.id)"
                />

                <Separator class="bg-[#d6dfeb]" />
                <SelectFilter
                  :label="conditionDefinition.label"
                  :placeholder="conditionDefinition.placeholder"
                  :options="conditionDefinition.options"
                  :model-value="getSingleValue(conditionDefinition.stateKey)"
                  @update:model-value="
                    (value) =>
                      setSingleValue(conditionDefinition.stateKey, value)
                  "
                />

                <Separator class="bg-[#d6dfeb]" />

                <div class="space-y-1">
                  <Button
                    variant="ghost"
                    class="h-9 justify-start px-2 text-[15px] text-[#1e2736] hover:bg-[#e9edf3]"
                    @click="isExtrasDialogOpen = true"
                  >
                    Auto extras konfigurieren
                  </Button>
                  <p class="text-xs text-[#5f6f87]">{{ extrasSummary }}</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div class="min-w-0">
          <ResultsPanel
            :filter-state="state"
            :applied-filters="appliedFilters"
            :on-clear-all="clearAllFilters"
            :on-remove-filter="removeAppliedFilter"
            @page-change="handleResultsPageChange"
            @sort-change="handleResultsSortChange"
            @favorite-change="handleResultsFavoriteChange"
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
    :search-value="state.extrasSearch"
    :door-options="doorsDefinition.options"
    :seat-options="seatsDefinition.options"
    :extra-options="extrasMultiDefinition.options"
    :filtered-extra-options="filteredExtraOptions"
    @update:open="(value) => (isExtrasDialogOpen = value)"
    @update:doors-value="(value) => setSingleValue('doors', value)"
    @update:seats-value="(value) => setSingleValue('seats', value)"
    @update:extras-value="(value) => setMultiValue('extras', value)"
    @update:search-value="(value) => (state.extrasSearch = value)"
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
