<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  loadExternalScriptsOnce,
  parseScriptUrls,
  waitForCustomElementDefinition
} from '@/widgets/filter/utils/shopScriptLoader'
import {
  buildShopQueryFromFilterState,
  mergeQueryParams
} from '@/widgets/filter/utils/queryBuilder'
import {
  applyShopWrapperAttributes,
  DEFAULT_SHOP_WRAPPER_CONFIG
} from '@/widgets/filter/utils/wrapperAttributes'
import { useFilterState } from '@/widgets/filter/composables/useFilterState'
import AppliedFiltersChips from './components/AppliedFiltersChips.vue'
import MultiSelectFilter from './components/MultiSelectFilter.vue'
import PriceRangeFilter from './components/PriceRangeFilter.vue'
import RangeSelectPair from './components/RangeSelectPair.vue'
import SelectFilter from './components/SelectFilter.vue'
import ExtrasDialog from './components/ExtrasDialog.vue'
import GuidedSearchDialog from './components/GuidedSearchDialog.vue'
import type { FiltersAppliedDetail } from '@/widgets/filter/types/events'
import type { AutoShopFilterWidgetProps } from '@/widgets/filter/types/wrapper'
import type {
  FilterState,
  MultiFilterDefinition,
  RangeFilterDefinition,
  SingleFilterDefinition
} from '@/widgets/filter/types/filters'

const DEFAULT_SHOP_WRAPPER_SCRIPT =
  'https://s3-eu-central-1.ionoscloud.com/static-webshop/881d1f9e-ce12-43ce-9a64-e9fe1caf1ff7/widgets/production/wrapper.js'
const WIDGET_MOUNT_CLASS_NAME = 'digital35-meinfahrzeugshop-suche-root'
const RESULTS_LOADING_TIMEOUT_MS = 10000
const RESULTS_LOADING_MIN_VISIBLE_MS = 400

const props = defineProps<AutoShopFilterWidgetProps>()

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
const resultsHostRef = ref<HTMLDivElement | null>(null)
const resultsWrapperRef = ref<HTMLElement | null>(null)
const isResultsLoading = ref(true)
const resultsError = ref<string | null>(null)
const resultsPage = ref(1)
const resultsRefreshToken = ref(0)
const hostChildBaseQueryParams = ref<string | null>(null)

let isUnmounted = false
let hostChildRestoreParent: Node | null = null
let hostChildRestoreNextSibling: Node | null = null
let resultsRenderObserver: MutationObserver | null = null
let resultsLoadingTimeoutId: number | null = null
let resultsLoadingMinDelayId: number | null = null
let resultsLoadingStartedAt = 0

const extrasSummary = computed(() => {
  if (!state.doors && !state.seats && state.extras.length === 0) {
    return 'Noch keine Extras ausgewaehlt'
  }

  const doorsLabel = state.doors ? `Tueren: ${state.doors}` : 'Tueren: -'
  const seatsLabel = state.seats ? `Sitze: ${state.seats}` : 'Sitze: -'
  return `${doorsLabel} | ${seatsLabel} | ${state.extras.length} Extras gewaehlt`
})

const resultsMetaText = computed(
  () => `Page ${resultsPage.value} | refresh #${resultsRefreshToken.value}`
)
const isAiSearchDisabled = computed(() => aiSearchQuery.value.trim().length === 0)
const externalScriptUrls = computed(() => {
  const parsedUrls = parseScriptUrls(props.scriptUrls)
  return parsedUrls.length > 0 ? parsedUrls : [DEFAULT_SHOP_WRAPPER_SCRIPT]
})

const filterQueryParams = computed(() => {
  const dynamicQueryParams = buildShopQueryFromFilterState(state)
  const baseQueryParams =
    props.queryParams ??
    hostChildBaseQueryParams.value ??
    DEFAULT_SHOP_WRAPPER_CONFIG.queryParams

  return mergeQueryParams(baseQueryParams, dynamicQueryParams)
})

function clearResultsLoadingWatchers(): void {
  if (resultsRenderObserver) {
    resultsRenderObserver.disconnect()
    resultsRenderObserver = null
  }

  if (resultsLoadingTimeoutId !== null) {
    window.clearTimeout(resultsLoadingTimeoutId)
    resultsLoadingTimeoutId = null
  }

  if (resultsLoadingMinDelayId !== null) {
    window.clearTimeout(resultsLoadingMinDelayId)
    resultsLoadingMinDelayId = null
  }
}

function hasWrapperRenderedContent(wrapperElement: HTMLElement): boolean {
  return (
    wrapperElement.querySelector('#webshop-widget') !== null ||
    wrapperElement.childElementCount > 0
  )
}

function finishResultsLoading(): void {
  if (isUnmounted) {
    return
  }

  if (resultsRenderObserver) {
    resultsRenderObserver.disconnect()
    resultsRenderObserver = null
  }

  if (resultsLoadingTimeoutId !== null) {
    window.clearTimeout(resultsLoadingTimeoutId)
    resultsLoadingTimeoutId = null
  }

  if (resultsLoadingMinDelayId !== null) {
    window.clearTimeout(resultsLoadingMinDelayId)
    resultsLoadingMinDelayId = null
  }

  const elapsed = Date.now() - resultsLoadingStartedAt
  const remaining = Math.max(0, RESULTS_LOADING_MIN_VISIBLE_MS - elapsed)

  if (remaining === 0) {
    isResultsLoading.value = false
    return
  }

  resultsLoadingMinDelayId = window.setTimeout(() => {
    resultsLoadingMinDelayId = null
    if (!isUnmounted) {
      isResultsLoading.value = false
    }
  }, remaining)
}

function beginResultsLoading(wrapperElement: HTMLElement | null): void {
  clearResultsLoadingWatchers()
  resultsLoadingStartedAt = Date.now()
  isResultsLoading.value = true

  if (!wrapperElement) {
    return
  }

  if (hasWrapperRenderedContent(wrapperElement)) {
    finishResultsLoading()
    return
  }

  resultsRenderObserver = new MutationObserver(() => {
    if (!resultsWrapperRef.value) {
      return
    }

    if (hasWrapperRenderedContent(resultsWrapperRef.value)) {
      finishResultsLoading()
    }
  })

  resultsRenderObserver.observe(wrapperElement, { childList: true, subtree: true })
  resultsLoadingTimeoutId = window.setTimeout(() => {
    finishResultsLoading()
  }, RESULTS_LOADING_TIMEOUT_MS)
}

function findHostProvidedResultsChild(): HTMLElement | null {
  const hostElement = props.hostElement
  if (!hostElement) {
    return null
  }

  const hostChildren = Array.from(hostElement.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      !child.classList.contains(WIDGET_MOUNT_CLASS_NAME)
  )

  return hostChildren[0] ?? null
}

function captureHostChildRestorePoint(element: HTMLElement): void {
  if (hostChildRestoreParent) {
    return
  }

  hostChildRestoreParent = element.parentNode
  hostChildRestoreNextSibling = element.nextSibling

  if (props.queryParams === undefined && hostChildBaseQueryParams.value === null) {
    hostChildBaseQueryParams.value = element.getAttribute('query-params') ?? ''
  }
}

function mountResultsWrapperElement(queryParams: string, forceRemount = false): void {
  const targetElement = resultsHostRef.value
  if (!targetElement) {
    return
  }

  if (!forceRemount) {
    const hostChild = findHostProvidedResultsChild()
    if (hostChild) {
      captureHostChildRestorePoint(hostChild)
      applyShopWrapperAttributes(hostChild, queryParams, props)
      targetElement.replaceChildren(hostChild)
      resultsWrapperRef.value = hostChild
      return
    }
  }

  if (!resultsWrapperRef.value || forceRemount) {
    const wrapperElement =
      forceRemount && resultsWrapperRef.value
        ? (resultsWrapperRef.value.cloneNode(false) as HTMLElement)
        : document.createElement('custom-elements-wrapper')

    applyShopWrapperAttributes(wrapperElement, queryParams, props)
    targetElement.replaceChildren(wrapperElement)
    resultsWrapperRef.value = wrapperElement
    return
  }

  applyShopWrapperAttributes(resultsWrapperRef.value, queryParams, props)
}

function getResultsWrapperElement(): HTMLElement | null {
  if (resultsWrapperRef.value) {
    return resultsWrapperRef.value
  }

  const targetElement = resultsHostRef.value
  const firstChild = targetElement?.firstElementChild
  return firstChild instanceof HTMLElement ? firstChild : null
}

function syncQueryParamsToResults(queryParams: string): void {
  const resultsWrapperElement = getResultsWrapperElement()
  if (!resultsWrapperElement) {
    return
  }

  const currentQueryParams = resultsWrapperElement.getAttribute('query-params') ?? ''
  if (currentQueryParams === queryParams) {
    return
  }

  resetPaginationAndRefresh()
  mountResultsWrapperElement(queryParams, true)
  beginResultsLoading(resultsWrapperRef.value)
}

function resetPaginationAndRefresh(): void {
  resultsPage.value = 1
  resultsRefreshToken.value += 1
}

function applyGuidedSearch(nextState: FilterState): void {
  applySnapshot(nextState)
  resetPaginationAndRefresh()

  const detail: FiltersAppliedDetail = {
    query: buildShopQueryFromFilterState(nextState),
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

onMounted(() => {
  beginResultsLoading(null)
  resultsError.value = null

  loadExternalScriptsOnce(externalScriptUrls.value)
    .then(() => waitForCustomElementDefinition('custom-elements-wrapper'))
    .then(() => {
      if (isUnmounted) {
        return
      }

      mountResultsWrapperElement(filterQueryParams.value)
      beginResultsLoading(resultsWrapperRef.value)
    })
    .catch((error: unknown) => {
      if (isUnmounted) {
        return
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden'
      resultsError.value = errorMessage
      isResultsLoading.value = false
      clearResultsLoadingWatchers()
    })
})

watch(filterQueryParams, (queryParams) => {
  syncQueryParamsToResults(queryParams)
})

onBeforeUnmount(() => {
  isUnmounted = true
  clearResultsLoadingWatchers()

  if (hostChildRestoreParent && resultsWrapperRef.value) {
    if (
      hostChildRestoreNextSibling &&
      hostChildRestoreNextSibling.parentNode === hostChildRestoreParent
    ) {
      hostChildRestoreParent.insertBefore(
        resultsWrapperRef.value,
        hostChildRestoreNextSibling
      )
    } else {
      hostChildRestoreParent.appendChild(resultsWrapperRef.value)
    }
  }

  hostChildRestoreParent = null
  hostChildRestoreNextSibling = null
  resultsWrapperRef.value = null
})
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

        <div class="min-w-0 space-y-4">
          <Card class="w-full border-[#c8d2de] bg-[#f7f9fc] shadow-none">
            <CardContent class="p-4">
              <AppliedFiltersChips
                :applied-filters="appliedFilters"
                :on-remove="removeAppliedFilter"
                :on-clear-all="clearAllFilters"
              />
            </CardContent>
          </Card>

          <Card class="w-full border-[#c8d2de] bg-[#f7f9fc] shadow-none">
            <CardHeader class="p-4 pb-3">
              <CardTitle class="text-[22px] leading-none text-[#2a3342]"
                >Results</CardTitle
              >
            </CardHeader>
            <CardContent class="p-4 pt-0">
              <div class="relative min-h-[320px] w-full">
                <div ref="resultsHostRef" class="min-h-[320px] w-full"></div>
                <div
                  v-if="isResultsLoading"
                  class="pointer-events-none absolute inset-0 z-[2147483647] flex items-center justify-center bg-[#f7f9fc]/78"
                >
                  <div
                    class="flex items-center gap-2 rounded-md border border-[#d6dfeb] bg-white px-3 py-2 text-xs text-[#5f6f87]"
                  >
                    <Loader2 class="size-4 animate-spin text-[#5f6f87]" />
                    <span>Laedt Ergebnisse...</span>
                  </div>
                </div>
                <p
                  v-else-if="resultsError"
                  class="absolute left-2 top-2 text-xs text-[#d04949]"
                >
                  Fehler: {{ resultsError }}
                </p>
              </div>
              <p class="mt-2 text-[11px] text-[#90a0b7]">
                {{ resultsMetaText }}
              </p>
            </CardContent>
          </Card>
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
