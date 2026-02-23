<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useFilterState } from '@/widgets/filter/composables/useFilterState'
import AppliedFiltersChips from './components/AppliedFiltersChips.vue'
import MultiSelectFilter from './components/MultiSelectFilter.vue'
import PriceRangeFilter from './components/PriceRangeFilter.vue'
import RangeSelectPair from './components/RangeSelectPair.vue'
import SelectFilter from './components/SelectFilter.vue'
import ExtrasDialog from './components/ExtrasDialog.vue'
import { mountHostChild, type HostChildMountResult } from '@/utils/hostSlot'
import type {
  MultiFilterDefinition,
  RangeFilterDefinition,
  SingleFilterDefinition
} from '@/widgets/filter/types/filters'

const props = defineProps<{
  hostElement?: HTMLElement | null
  resultsChildSelector?: string
}>()

const filter = useFilterState()
const state = filter.state

const {
  appliedFilters,
  budgetDefinition,
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

const categoryDefinition = requireSingleDefinition(vehicleSingleDefinitions.value, 'category')
const transmissionDefinition = requireSingleDefinition(vehicleSingleDefinitions.value, 'transmission')
const conditionDefinition = requireSingleDefinition(vehicleSingleDefinitions.value, 'condition')
const yearDefinition = requireRangeDefinition(vehicleRangeDefinitions.value, 'year')
const kilometerDefinition = requireRangeDefinition(vehicleRangeDefinitions.value, 'kilometer')
const powerDefinition = requireRangeDefinition(vehicleRangeDefinitions.value, 'power')
const displacementDefinition = requireRangeDefinition(vehicleRangeDefinitions.value, 'displacement')
const doorsDefinition = requireSingleDefinition(extrasSingleDefinitions.value, 'doors')
const seatsDefinition = requireSingleDefinition(extrasSingleDefinitions.value, 'seats')
const extrasMultiDefinition = requireMultiDefinition(
  extrasDefinition.value ? [extrasDefinition.value] : [],
  'extras'
)

const isExtrasDialogOpen = ref(false)
const resultsHostRef = ref<HTMLDivElement | null>(null)
const hasExternalResults = ref(false)

let hostSlotMount: HostChildMountResult | null = null
let resultsObserver: MutationObserver | null = null

const extrasSummary = computed(() => {
  if (!state.doors && !state.seats && state.extras.length === 0) {
    return 'Noch keine Extras ausgewaehlt'
  }

  const doorsLabel = state.doors ? `Tueren: ${state.doors}` : 'Tueren: -'
  const seatsLabel = state.seats ? `Sitze: ${state.seats}` : 'Sitze: -'
  return `${doorsLabel} | ${seatsLabel} | ${state.extras.length} Extras gewaehlt`
})

onMounted(() => {
  const targetElement = resultsHostRef.value
  if (!targetElement) {
    return
  }

  hostSlotMount = mountHostChild({
    hostElement: props.hostElement,
    selector: props.resultsChildSelector,
    targetElement
  })

  hasExternalResults.value = hostSlotMount.mounted || targetElement.childElementCount > 0

  resultsObserver = new MutationObserver(() => {
    hasExternalResults.value = targetElement.childElementCount > 0
  })

  resultsObserver.observe(targetElement, { childList: true })
})

onBeforeUnmount(() => {
  resultsObserver?.disconnect()
  resultsObserver = null
  hostSlotMount?.unmount()
  hostSlotMount = null
})
</script>

<template>
  <section class="mx-auto w-full max-w-[1180px] rounded-2xl border border-[#cfd9e6] bg-[#f4f6f9] p-4 shadow-sm">
    <div class="mb-6">
      <h1 class="text-[36px] leading-[0.9] font-semibold tracking-[-0.03em] text-[#202735]">
        Digital 35 - Challenge
      </h1>
    </div>

    <Card class="border-[#c8d2de] bg-[#f7f9fc] shadow-none">
      <CardHeader class="gap-4 p-4">
        <div>
          <CardTitle class="text-[2rem] leading-[0.95] text-[#2a3342]">Search &amp; Filter</CardTitle>
          <CardDescription class="mt-2 text-sm leading-6 text-[#5f6f87]">Standalone Filter UI.</CardDescription>
        </div>
        <Button class="h-10 w-fit rounded-xl bg-[#3f82f6] px-5 text-[17px] text-white hover:bg-[#2d72e8]">
          Start Guided Search
        </Button>
      </CardHeader>

      <CardContent class="p-4 pt-0">
        <div class="mx-auto grid w-full max-w-[1320px] gap-4 lg:grid-cols-[370px_minmax(0,1fr)] lg:items-start">
          <Card class="w-full border-[#c8d2de] bg-[#f7f9fc] shadow-none">
            <CardHeader class="p-4">
              <CardTitle class="text-[32px] leading-none tracking-[-0.03em] text-[#2a3342]">Filters</CardTitle>
            </CardHeader>

            <CardContent class="space-y-4 p-4 pt-0">
              <Card class="border-[#c3cfdd] bg-[#f7f9fc] shadow-none">
                <CardContent class="space-y-3 p-3">
                  <PriceRangeFilter
                    :label="budgetDefinition?.label ?? 'Budget'"
                    :min-value="state.minPrice"
                    :max-value="state.maxPrice"
                    @update:min-value="setMinPrice"
                    @update:max-value="setMaxPrice"
                    @keydown="handlePriceKeydown"
                    @paste="handlePricePaste"
                    @clear="clearDefinition('budget')"
                  />

                  <template
                    v-for="(definition, index) in budgetMultiDefinitions"
                    :key="definition.id"
                  >
                    <Separator
                      v-if="index >= 0"
                      class="bg-[#d6dfeb]"
                    />
                    <MultiSelectFilter
                      :label="definition.label"
                      :placeholder="definition.placeholder"
                      :empty-text="definition.emptyText"
                      :options="definition.options"
                      :model-value="getMultiValue(definition.stateKey)"
                      :show-chips="definition.showChips ?? true"
                      @update:model-value="(value) => setMultiValue(definition.stateKey, value)"
                    />
                  </template>
                </CardContent>
              </Card>

              <Card class="border-[#c3cfdd] bg-[#f7f9fc] shadow-none">
                <CardHeader class="p-3 pb-2">
                  <CardTitle class="text-[26px] leading-none tracking-[-0.02em] text-[#2a3342]">Fahrzeugdetails</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4 p-3 pt-0">
                  <SelectFilter
                    :label="categoryDefinition.label"
                    :placeholder="categoryDefinition.placeholder"
                    :options="categoryDefinition.options"
                    :model-value="getSingleValue(categoryDefinition.stateKey)"
                    @update:model-value="(value) => setSingleValue(categoryDefinition.stateKey, value)"
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
                      @update:model-value="(value) => setMultiValue(definition.stateKey, value)"
                    />
                  </template>

                  <Separator class="bg-[#d6dfeb]" />
                  <SelectFilter
                    :label="transmissionDefinition.label"
                    :placeholder="transmissionDefinition.placeholder"
                    :options="transmissionDefinition.options"
                    :model-value="getSingleValue(transmissionDefinition.stateKey)"
                    @update:model-value="(value) => setSingleValue(transmissionDefinition.stateKey, value)"
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
                    @update:from-value="(value) => (state.displacementFrom = value)"
                    @update:to-value="(value) => (state.displacementTo = value)"
                    @clear="clearDefinition(displacementDefinition.id)"
                  />

                  <Separator class="bg-[#d6dfeb]" />
                  <SelectFilter
                    :label="conditionDefinition.label"
                    :placeholder="conditionDefinition.placeholder"
                    :options="conditionDefinition.options"
                    :model-value="getSingleValue(conditionDefinition.stateKey)"
                    @update:model-value="(value) => setSingleValue(conditionDefinition.stateKey, value)"
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

          <div class="space-y-4">
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
                <CardTitle class="text-[22px] leading-none text-[#2a3342]">Results</CardTitle>
              </CardHeader>
              <CardContent class="p-4 pt-0">
                <div
                  ref="resultsHostRef"
                  class="min-h-[320px] w-full"
                ></div>
                <p
                  v-if="!hasExternalResults"
                  class="text-xs text-[#90a0b7]"
                >
                  Kein externes Ergebnis-Element gefunden.
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
  </section>
</template>
