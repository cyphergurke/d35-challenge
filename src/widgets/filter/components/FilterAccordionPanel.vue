<script setup lang="ts">
import { computed, type Component } from 'vue'
import { CarFront, Caravan, Scooter, Truck, Van } from 'lucide-vue-next'
import type { AcceptableValue } from 'reka-ui'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem
} from '@/components/ui/accordion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import MultiSelectFilter from '@/widgets/filter/components/MultiSelectFilter.vue'
import PriceRangeFilter from '@/widgets/filter/components/PriceRangeFilter.vue'
import RangeSelectPair from '@/widgets/filter/components/RangeSelectPair.vue'
import SelectFilter from '@/widgets/filter/components/SelectFilter.vue'
import FilterRowHeader from '@/widgets/filter/components/FilterRowHeader.vue'
import type {
  FilterDefinition,
  FilterOption,
  FilterState,
  MultiFilterDefinition,
  MultiFilterStateKey,
  PriceFilterDefinition,
  RangeFilterDefinition,
  RangeFromStateKey,
  RangeToStateKey,
  RateViewValue,
  SingleFilterDefinition,
  SingleFilterStateKey
} from '@/widgets/filter/types/filters'

interface RateViewOption {
  value: RateViewValue
  label: string
}

interface Props {
  state: FilterState
  rateViewOptions: readonly RateViewOption[]
  budgetDefinition: PriceFilterDefinition
  categoryDefinition: SingleFilterDefinition
  markeDefinition: MultiFilterDefinition
  modelDefinition: MultiFilterDefinition
  yearDefinition: RangeFilterDefinition
  kilometerDefinition: RangeFilterDefinition
  powerDefinition: RangeFilterDefinition
  displacementDefinition: RangeFilterDefinition
  conditionDefinition: SingleFilterDefinition
  fuelDefinition: MultiFilterDefinition
  transmissionDefinition: SingleFilterDefinition
  yearOptions: FilterOption[]
  kilometerOptions: FilterOption[]
  powerOptions: FilterOption[]
  displacementOptions: FilterOption[]
  yearToOptions: FilterOption[]
  kilometerToOptions: FilterOption[]
  powerToOptions: FilterOption[]
  displacementToOptions: FilterOption[]
  isKilometerToDisabled: boolean
  getMultiValue: (stateKey: MultiFilterStateKey) => string[]
  setMultiValue: (stateKey: MultiFilterStateKey, value: string[]) => void
  getSingleValue: (stateKey: SingleFilterStateKey) => string | undefined
  setSingleValue: (
    stateKey: SingleFilterStateKey,
    value: string | undefined
  ) => void
  getRangeValue: (
    stateKey: RangeFromStateKey | RangeToStateKey
  ) => string | undefined
  setRangeValue: (
    stateKey: RangeFromStateKey | RangeToStateKey,
    value: string | undefined
  ) => void
  setRateView: (value: RateViewValue) => void
  clearDefinition: (definitionId: FilterDefinition['id']) => void
  clearAllFilters: () => void
  setMinPrice: (value: string | number) => void
  setMaxPrice: (value: string | number) => void
  handlePriceKeydown: (event: KeyboardEvent) => void
  handlePricePaste: (event: ClipboardEvent) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'open-extras'): void
}>()

interface CategoryQuickOption {
  value: string
  label: string
  icon: Component
}

const categoryQuickOptions = computed<CategoryQuickOption[]>(() => {
  const iconByCategoryValue: Record<string, Component> = {
    PKW: CarFront,
    Motorrad: Scooter,
    Transporter: Van,
    Wohnmobil: Caravan,
    LKW: Truck
  }

  return props.categoryDefinition.options.map((option) => ({
    value: option.value,
    label: option.label,
    icon: iconByCategoryValue[option.value] ?? CarFront
  }))
})

const RATE_VIEW_VALUES = ['financing', 'leasing', 'subscription'] as const

function isRateViewValue(value: string): value is RateViewValue {
  return RATE_VIEW_VALUES.includes(value as RateViewValue)
}

function handleRateViewChange(
  value: AcceptableValue | AcceptableValue[]
): void {
  const nextValue = Array.isArray(value) ? value[0] : value
  if (nextValue === null || nextValue === undefined) {
    return
  }

  const normalizedValue = String(nextValue)
  if (!isRateViewValue(normalizedValue)) {
    return
  }

  props.setRateView(normalizedValue)
}

function handleCategoryQuickChange(
  value: AcceptableValue | AcceptableValue[]
): void {
  const nextValue = Array.isArray(value) ? value[0] : value
  if (nextValue === null || nextValue === undefined) {
    return
  }

  props.setSingleValue('category', String(nextValue))
}

const modelPlaceholder = computed(() =>
  props.state.marke.length > 0
    ? props.modelDefinition.placeholder
    : 'Bitte zuerst Marke waehlen'
)

const markeModelCount = computed(
  () => props.state.marke.length + props.state.model.length
)
const categoryCount = computed(() => (props.state.category ? 1 : 0))
const yearCount = computed(
  () => Number(Boolean(props.state.yearFrom)) + Number(Boolean(props.state.yearTo))
)
const kilometerCount = computed(
  () =>
    Number(Boolean(props.state.kilometerFrom)) +
    Number(Boolean(props.state.kilometerTo))
)
const priceCount = computed(() => {
  const min = props.state.minPrice.trim().length > 0 ? 1 : 0
  const max = props.state.maxPrice.trim().length > 0 ? 1 : 0
  return min + max
})
const powerCount = computed(
  () => Number(Boolean(props.state.powerFrom)) + Number(Boolean(props.state.powerTo))
)
const displacementCount = computed(
  () =>
    Number(Boolean(props.state.displacementFrom)) +
    Number(Boolean(props.state.displacementTo))
)
const conditionCount = computed(() => (props.state.condition ? 1 : 0))
const fuelCount = computed(() => props.state.fuel.length)
const transmissionCount = computed(() => (props.state.transmission ? 1 : 0))

function resetMarkeModel(): void {
  props.clearDefinition('marke')
  props.clearDefinition('model')
}
</script>

<template>
  <div class="rounded-lg border border-[#c8d2de] bg-[#f7f9fc] p-3 sm:p-4">
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-[15px] font-semibold text-[#223247]">Filter</h2>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
          @click="clearAllFilters"
        >
          Alle löschen
        </Button>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-[#607796]">
          Fahrzeugart
        </p>
        <ToggleGroup
          type="single"
          :model-value="state.category"
          class="grid gap-2"
          :style="{
            gridTemplateColumns: `repeat(${Math.max(categoryQuickOptions.length, 1)}, minmax(0, 1fr))`
          }"
          @update:model-value="handleCategoryQuickChange"
        >
          <ToggleGroupItem
            v-for="option in categoryQuickOptions"
            :key="option.value"
            :value="option.value"
            variant="outline"
            :title="option.label"
            class="h-10 rounded-md border-[#ccd7e6] bg-white text-[#365d8f] data-[state=on]:border-[#7ea4d2] data-[state=on]:bg-[#e9f1fb]"
          >
            <component :is="option.icon" class="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-[#607796]">
          Ratenansicht
        </p>
        <RadioGroup
          :model-value="state.rateView"
          class="gap-1"
          @update:model-value="handleRateViewChange"
        >
          <label
            v-for="option in rateViewOptions"
            :key="`rate-view-${option.value}`"
            class="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm text-[#223247] hover:bg-[#edf2f8]"
          >
            <RadioGroupItem :value="option.value" />
            <span>{{ option.label }}</span>
          </label>
        </RadioGroup>
      </div>
    </div>

    <Separator class="my-3 bg-[#d6dfeb]" />

    <Accordion type="single" collapsible default-value="marke-model" class="w-full">
      <AccordionItem value="marke-model" class="border-[#d6dfeb]">
        <FilterRowHeader label="Marke und Model" :active-count="markeModelCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="markeModelCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="resetMarkeModel"
              >
                Zurücksetzen
              </Button>
            </div>
            <MultiSelectFilter
              :label="markeDefinition.label"
              :placeholder="markeDefinition.placeholder"
              :empty-text="markeDefinition.emptyText"
              :options="markeDefinition.options"
              :model-value="getMultiValue(markeDefinition.stateKey)"
              :show-clear="false"
              :show-chips="markeDefinition.showChips ?? true"
              title-class="text-sm font-semibold text-[#223247]"
              @update:model-value="(value) => setMultiValue(markeDefinition.stateKey, value)"
            />
            <MultiSelectFilter
              :label="modelDefinition.label"
              :placeholder="modelPlaceholder"
              :empty-text="modelDefinition.emptyText"
              :options="modelDefinition.options"
              :model-value="getMultiValue(modelDefinition.stateKey)"
              :show-clear="false"
              :show-chips="modelDefinition.showChips ?? true"
              title-class="text-sm font-semibold text-[#223247]"
              @update:model-value="(value) => setMultiValue(modelDefinition.stateKey, value)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="category" class="border-[#d6dfeb]">
        <FilterRowHeader label="Kategorie" :active-count="categoryCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="categoryCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(categoryDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <SelectFilter
              :label="categoryDefinition.label"
              :placeholder="categoryDefinition.placeholder"
              :options="categoryDefinition.options"
              :show-clear="false"
              title-class="sr-only"
              :model-value="getSingleValue(categoryDefinition.stateKey)"
              @update:model-value="(value) => setSingleValue(categoryDefinition.stateKey, value)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="year" class="border-[#d6dfeb]">
        <FilterRowHeader label="Erstzulassung" :active-count="yearCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="yearCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(yearDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <RangeSelectPair
              :label="yearDefinition.label"
              :from-value="getRangeValue(yearDefinition.fromKey)"
              :to-value="getRangeValue(yearDefinition.toKey)"
              :from-options="yearOptions"
              :to-options="yearToOptions"
              :show-clear="false"
              title-class="sr-only"
              @update:from-value="(value) => setRangeValue(yearDefinition.fromKey, value)"
              @update:to-value="(value) => setRangeValue(yearDefinition.toKey, value)"
              @clear="clearDefinition(yearDefinition.id)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="kilometer" class="border-[#d6dfeb]">
        <FilterRowHeader label="Kilometer" :active-count="kilometerCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="kilometerCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(kilometerDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <RangeSelectPair
              :label="kilometerDefinition.label"
              :from-value="getRangeValue(kilometerDefinition.fromKey)"
              :to-value="getRangeValue(kilometerDefinition.toKey)"
              :from-options="kilometerOptions"
              :to-options="kilometerToOptions"
              :to-disabled="isKilometerToDisabled"
              :show-clear="false"
              title-class="sr-only"
              @update:from-value="(value) => setRangeValue(kilometerDefinition.fromKey, value)"
              @update:to-value="(value) => setRangeValue(kilometerDefinition.toKey, value)"
              @clear="clearDefinition(kilometerDefinition.id)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price" class="border-[#d6dfeb]">
        <FilterRowHeader label="Preis" :active-count="priceCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="priceCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition('budget')"
              >
                Zurücksetzen
              </Button>
            </div>
            <PriceRangeFilter
              :label="budgetDefinition.label"
              :min-value="state.minPrice"
              :max-value="state.maxPrice"
              :show-clear="false"
              title-class="sr-only"
              @update:min-value="setMinPrice"
              @update:max-value="setMaxPrice"
              @keydown="handlePriceKeydown"
              @paste="handlePricePaste"
              @clear="clearDefinition('budget')"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="power" class="border-[#d6dfeb]">
        <FilterRowHeader label="Leistung" :active-count="powerCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="powerCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(powerDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <RangeSelectPair
              :label="powerDefinition.label"
              :from-value="getRangeValue(powerDefinition.fromKey)"
              :to-value="getRangeValue(powerDefinition.toKey)"
              :from-options="powerOptions"
              :to-options="powerToOptions"
              :show-clear="false"
              title-class="sr-only"
              @update:from-value="(value) => setRangeValue(powerDefinition.fromKey, value)"
              @update:to-value="(value) => setRangeValue(powerDefinition.toKey, value)"
              @clear="clearDefinition(powerDefinition.id)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="displacement" class="border-[#d6dfeb]">
        <FilterRowHeader label="Hubraum" :active-count="displacementCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="displacementCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(displacementDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <RangeSelectPair
              :label="displacementDefinition.label"
              :from-value="getRangeValue(displacementDefinition.fromKey)"
              :to-value="getRangeValue(displacementDefinition.toKey)"
              :from-options="displacementOptions"
              :to-options="displacementToOptions"
              :show-clear="false"
              title-class="sr-only"
              @update:from-value="(value) => setRangeValue(displacementDefinition.fromKey, value)"
              @update:to-value="(value) => setRangeValue(displacementDefinition.toKey, value)"
              @clear="clearDefinition(displacementDefinition.id)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="condition" class="border-[#d6dfeb]">
        <FilterRowHeader label="Fahrzeugzustand" :active-count="conditionCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="conditionCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(conditionDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <SelectFilter
              :label="conditionDefinition.label"
              :placeholder="conditionDefinition.placeholder"
              :options="conditionDefinition.options"
              :show-clear="false"
              title-class="sr-only"
              :model-value="getSingleValue(conditionDefinition.stateKey)"
              @update:model-value="(value) => setSingleValue(conditionDefinition.stateKey, value)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fuel" class="border-[#d6dfeb]">
        <FilterRowHeader label="Kraftstoff" :active-count="fuelCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="fuelCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(fuelDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <MultiSelectFilter
              :label="fuelDefinition.label"
              :placeholder="fuelDefinition.placeholder"
              :empty-text="fuelDefinition.emptyText"
              :options="fuelDefinition.options"
              :show-clear="false"
              :show-chips="fuelDefinition.showChips ?? true"
              title-class="sr-only"
              :model-value="getMultiValue(fuelDefinition.stateKey)"
              @update:model-value="(value) => setMultiValue(fuelDefinition.stateKey, value)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="transmission" class="border-[#d6dfeb]">
        <FilterRowHeader label="Getriebe" :active-count="transmissionCount" />
        <AccordionContent class="px-1">
          <div class="space-y-3">
            <div v-if="transmissionCount > 0" class="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-[#556985] hover:bg-[#e9edf3]"
                @click="clearDefinition(transmissionDefinition.id)"
              >
                Zurücksetzen
              </Button>
            </div>
            <SelectFilter
              :label="transmissionDefinition.label"
              :placeholder="transmissionDefinition.placeholder"
              :options="transmissionDefinition.options"
              :show-clear="false"
              title-class="sr-only"
              :model-value="getSingleValue(transmissionDefinition.stateKey)"
              @update:model-value="(value) => setSingleValue(transmissionDefinition.stateKey, value)"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <div class="pt-2">
      <Button
        variant="link"
        class="h-auto p-0 text-sm font-medium text-[#2b5f9f]"
        @click="emit('open-extras')"
      >
        Detailsuche
      </Button>
    </div>
  </div>
</template>
