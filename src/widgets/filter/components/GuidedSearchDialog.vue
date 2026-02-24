<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  FilterOption,
  FilterState,
  MultiFilterDefinition,
  PriceFilterDefinition,
  RangeFilterDefinition,
  SingleFilterDefinition
} from '@/widgets/filter/types/filters'
import { cloneFilterState } from '@/widgets/filter/utils/filterState'
import {
  isAllowedPriceKey,
  isValidNumericPaste,
  sanitizeNumericInput
} from '@/widgets/filter/utils/helpers'
import MultiSelectFilter from './MultiSelectFilter.vue'
import PriceRangeFilter from './PriceRangeFilter.vue'
import RangeSelectPair from './RangeSelectPair.vue'
import SelectFilter from './SelectFilter.vue'

interface GuidedDefinitions {
  budget: PriceFilterDefinition
  financing: MultiFilterDefinition
  location: SingleFilterDefinition
  radius: SingleFilterDefinition
  category: SingleFilterDefinition
  marke: MultiFilterDefinition
  model: MultiFilterDefinition
  year: RangeFilterDefinition
  kilometer: RangeFilterDefinition
  power: RangeFilterDefinition
  displacement: RangeFilterDefinition
  fuel: MultiFilterDefinition
  transmission: SingleFilterDefinition
  bodyType: MultiFilterDefinition
  condition: SingleFilterDefinition
  doors: SingleFilterDefinition
  seats: SingleFilterDefinition
  extras: MultiFilterDefinition
}

type GuidedStepId =
  | 'budget'
  | 'location'
  | 'brand-model'
  | 'history'
  | 'vehicle'
  | 'equipment'

interface GuidedStep {
  id: GuidedStepId
  label: string
  optional?: boolean
}

interface Props {
  open: boolean
  initialState: FilterState
  definitions: GuidedDefinitions
  yearOptions: FilterOption[]
  kilometerOptions: FilterOption[]
  powerOptions: FilterOption[]
  displacementOptions: FilterOption[]
  getYearToOptionsFor: (yearFrom: string | undefined) => FilterOption[]
  getKilometerToOptionsFor: (
    kilometerFrom: string | undefined
  ) => FilterOption[]
  getPowerToOptionsFor: (powerFrom: string | undefined) => FilterOption[]
  getDisplacementToOptionsFor: (
    displacementFrom: string | undefined
  ) => FilterOption[]
  isKilometerToDisabledFor: (kilometerFrom: string | undefined) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'apply', nextState: FilterState): void
}>()

const steps: GuidedStep[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'location', label: 'Standort', optional: true },
  { id: 'brand-model', label: 'Marke & Modell' },
  { id: 'history', label: 'Baujahr & Kilometer', optional: true },
  { id: 'vehicle', label: 'Fahrzeugtyp' },
  { id: 'equipment', label: 'Ausstattung', optional: true }
]

const fallbackStep: GuidedStep = { id: 'budget', label: 'Budget' }

const draftState = reactive<FilterState>(cloneFilterState(props.initialState))
const extrasSearch = ref('')
const currentStepIndex = ref(0)

const openProxy = computed<boolean>({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    const snapshot = cloneFilterState(props.initialState)
    Object.assign(draftState, snapshot)
    extrasSearch.value = ''
    currentStepIndex.value = 0
  }
)

const currentStep = computed<GuidedStep>(
  () => steps[currentStepIndex.value] ?? fallbackStep
)

const progressValue = computed(() => {
  const totalSteps = steps.length
  return Math.round(((currentStepIndex.value + 1) / totalSteps) * 100)
})

const currentStepValue = computed<GuidedStepId>({
  get: () => currentStep.value.id,
  set: (value) => {
    const index = steps.findIndex((step) => step.id === value)
    if (index === -1 || index > currentStepIndex.value + 1) {
      return
    }

    currentStepIndex.value = index
  }
})

const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
const canGoBack = computed(() => currentStepIndex.value > 0)
const canSkip = computed(
  () => Boolean(currentStep.value.optional) && !isLastStep.value
)

const hasBudgetRangeError = computed(() => {
  if (!draftState.minPrice || !draftState.maxPrice) {
    return false
  }

  return Number(draftState.minPrice) > Number(draftState.maxPrice)
})

const canGoNext = computed(() => !hasBudgetRangeError.value)

const filteredExtraOptions = computed(() => {
  const searchTerm = extrasSearch.value.trim().toLowerCase()
  if (!searchTerm) {
    return props.definitions.extras.options
  }

  return props.definitions.extras.options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm)
  )
})

const popularExtraOptions = computed(() =>
  props.definitions.extras.options.slice(0, 10)
)

function goNext(): void {
  if (!canGoNext.value || isLastStep.value) {
    return
  }

  currentStepIndex.value += 1
}

function goBack(): void {
  if (!canGoBack.value) {
    return
  }

  currentStepIndex.value -= 1
}

function skipStep(): void {
  if (!canSkip.value) {
    return
  }

  currentStepIndex.value += 1
}

function applyAndClose(): void {
  emit('apply', cloneFilterState(draftState))
  emit('update:open', false)
}

function setDraftMinPrice(value: string | number): void {
  draftState.minPrice = sanitizeNumericInput(value)
}

function setDraftMaxPrice(value: string | number): void {
  draftState.maxPrice = sanitizeNumericInput(value)
}

function handlePriceKeydown(event: KeyboardEvent): void {
  if (!isAllowedPriceKey(event)) {
    event.preventDefault()
  }
}

function handlePricePaste(event: ClipboardEvent): void {
  if (!isValidNumericPaste(event)) {
    event.preventDefault()
  }
}

function toggleExtra(extra: string): void {
  if (draftState.extras.includes(extra)) {
    draftState.extras = draftState.extras.filter((value) => value !== extra)
    return
  }

  draftState.extras = [...draftState.extras, extra]
}
</script>

<template>
  <Dialog v-model:open="openProxy">
    <DialogContent
      class="max-h-[92vh] w-[96vw] max-w-[960px] overflow-hidden rounded-2xl border-[#c8d2de] bg-[#f7f9fc] p-0"
    >
      <DialogHeader class="space-y-3 border-b border-[#d6dfeb] px-5 py-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <DialogTitle class="text-[26px] text-[#2a3342]"
              >Geführte Suche starten</DialogTitle
            >
            <DialogDescription class="mt-1 text-sm text-[#5f6f87]">
              Schritt {{ currentStepIndex + 1 }} von {{ steps.length }}:
              {{ currentStep.label }}
            </DialogDescription>
          </div>
        </div>
        <Progress :model-value="progressValue" class="h-2 bg-[#d8e2f0]" />
      </DialogHeader>

      <Tabs v-model="currentStepValue" class="flex h-full flex-col">
        <TabsList
          class="mx-5 mt-4 grid h-auto grid-cols-3 gap-2 bg-transparent p-0 md:grid-cols-6"
        >
          <TabsTrigger
            v-for="(step, index) in steps"
            :key="step.id"
            :value="step.id"
            :disabled="index > currentStepIndex + 1"
            class="h-9 border border-[#c3cfdd] bg-white text-xs text-[#2a3342] data-[state=active]:bg-[#e7eef8]"
          >
            {{ index + 1 }}. {{ step.label }}
          </TabsTrigger>
        </TabsList>

        <div class="overflow-y-auto px-5 py-4">
          <div
            v-if="hasBudgetRangeError"
            class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            Budget-Fehler: Der Maximalpreis darf nicht kleiner als der
            Minimalpreis sein.
          </div>

          <section v-if="currentStep.id === 'budget'" class="space-y-4">
            <PriceRangeFilter
              :label="definitions.budget.label"
              :min-value="draftState.minPrice"
              :max-value="draftState.maxPrice"
              @update:min-value="setDraftMinPrice"
              @update:max-value="setDraftMaxPrice"
              @keydown="handlePriceKeydown"
              @paste="handlePricePaste"
              @clear="
                () => {
                  draftState.minPrice = ''
                  draftState.maxPrice = ''
                }
              "
            />

            <Separator class="bg-[#d6dfeb]" />

            <MultiSelectFilter
              :label="definitions.financing.label"
              :placeholder="definitions.financing.placeholder"
              :empty-text="definitions.financing.emptyText"
              :options="definitions.financing.options"
              :model-value="draftState.financing"
              :show-chips="true"
              @update:model-value="
                (value) => (draftState.financing = [...value])
              "
            />
          </section>

          <section v-else-if="currentStep.id === 'location'" class="space-y-4">
            <SelectFilter
              :label="definitions.location.label"
              :placeholder="definitions.location.placeholder"
              :options="definitions.location.options"
              :model-value="draftState.location"
              @update:model-value="(value) => (draftState.location = value)"
            />
            <Separator class="bg-[#d6dfeb]" />
            <SelectFilter
              :label="definitions.radius.label"
              :placeholder="definitions.radius.placeholder"
              :options="definitions.radius.options"
              :model-value="draftState.radius"
              @update:model-value="(value) => (draftState.radius = value)"
            />
          </section>

          <section
            v-else-if="currentStep.id === 'brand-model'"
            class="space-y-4"
          >
            <SelectFilter
              :label="definitions.category.label"
              :placeholder="definitions.category.placeholder"
              :options="definitions.category.options"
              :model-value="draftState.category"
              @update:model-value="(value) => (draftState.category = value)"
            />

            <Separator class="bg-[#d6dfeb]" />

            <MultiSelectFilter
              :label="definitions.marke.label"
              :placeholder="definitions.marke.placeholder"
              :empty-text="definitions.marke.emptyText"
              :options="definitions.marke.options"
              :model-value="draftState.marke"
              :show-chips="true"
              @update:model-value="(value) => (draftState.marke = [...value])"
            />

            <Separator class="bg-[#d6dfeb]" />

            <MultiSelectFilter
              :label="definitions.model.label"
              :placeholder="definitions.model.placeholder"
              :empty-text="definitions.model.emptyText"
              :options="definitions.model.options"
              :model-value="draftState.model"
              :show-chips="true"
              @update:model-value="(value) => (draftState.model = [...value])"
            />
          </section>

          <section v-else-if="currentStep.id === 'history'" class="space-y-4">
            <RangeSelectPair
              :label="definitions.year.label"
              :from-value="draftState.yearFrom"
              :to-value="draftState.yearTo"
              :from-options="yearOptions"
              :to-options="getYearToOptionsFor(draftState.yearFrom)"
              @update:from-value="(value) => (draftState.yearFrom = value)"
              @update:to-value="(value) => (draftState.yearTo = value)"
              @clear="
                () => {
                  draftState.yearFrom = undefined
                  draftState.yearTo = undefined
                }
              "
            />

            <Separator class="bg-[#d6dfeb]" />

            <RangeSelectPair
              :label="definitions.kilometer.label"
              :from-value="draftState.kilometerFrom"
              :to-value="draftState.kilometerTo"
              :from-options="kilometerOptions"
              :to-options="getKilometerToOptionsFor(draftState.kilometerFrom)"
              :to-disabled="isKilometerToDisabledFor(draftState.kilometerFrom)"
              @update:from-value="(value) => (draftState.kilometerFrom = value)"
              @update:to-value="(value) => (draftState.kilometerTo = value)"
              @clear="
                () => {
                  draftState.kilometerFrom = undefined
                  draftState.kilometerTo = undefined
                }
              "
            />
          </section>

          <section v-else-if="currentStep.id === 'vehicle'" class="space-y-4">
            <RangeSelectPair
              :label="definitions.power.label"
              :from-value="draftState.powerFrom"
              :to-value="draftState.powerTo"
              :from-options="powerOptions"
              :to-options="getPowerToOptionsFor(draftState.powerFrom)"
              @update:from-value="(value) => (draftState.powerFrom = value)"
              @update:to-value="(value) => (draftState.powerTo = value)"
              @clear="
                () => {
                  draftState.powerFrom = undefined
                  draftState.powerTo = undefined
                }
              "
            />

            <Separator class="bg-[#d6dfeb]" />

            <RangeSelectPair
              :label="definitions.displacement.label"
              :from-value="draftState.displacementFrom"
              :to-value="draftState.displacementTo"
              :from-options="displacementOptions"
              :to-options="
                getDisplacementToOptionsFor(draftState.displacementFrom)
              "
              @update:from-value="
                (value) => (draftState.displacementFrom = value)
              "
              @update:to-value="(value) => (draftState.displacementTo = value)"
              @clear="
                () => {
                  draftState.displacementFrom = undefined
                  draftState.displacementTo = undefined
                }
              "
            />

            <Separator class="bg-[#d6dfeb]" />

            <MultiSelectFilter
              :label="definitions.fuel.label"
              :placeholder="definitions.fuel.placeholder"
              :empty-text="definitions.fuel.emptyText"
              :options="definitions.fuel.options"
              :model-value="draftState.fuel"
              :show-chips="true"
              @update:model-value="(value) => (draftState.fuel = [...value])"
            />

            <Separator class="bg-[#d6dfeb]" />

            <SelectFilter
              :label="definitions.transmission.label"
              :placeholder="definitions.transmission.placeholder"
              :options="definitions.transmission.options"
              :model-value="draftState.transmission"
              @update:model-value="(value) => (draftState.transmission = value)"
            />

            <Separator class="bg-[#d6dfeb]" />

            <MultiSelectFilter
              :label="definitions.bodyType.label"
              :placeholder="definitions.bodyType.placeholder"
              :empty-text="definitions.bodyType.emptyText"
              :options="definitions.bodyType.options"
              :model-value="draftState.bodyType"
              :show-chips="true"
              @update:model-value="
                (value) => (draftState.bodyType = [...value])
              "
            />
          </section>

          <section v-else class="space-y-4">
            <SelectFilter
              :label="definitions.condition.label"
              :placeholder="definitions.condition.placeholder"
              :options="definitions.condition.options"
              :model-value="draftState.condition"
              @update:model-value="(value) => (draftState.condition = value)"
            />

            <Separator class="bg-[#d6dfeb]" />

            <div class="grid gap-4 md:grid-cols-2">
              <SelectFilter
                :label="definitions.doors.label"
                :placeholder="definitions.doors.placeholder"
                :options="definitions.doors.options"
                :model-value="draftState.doors"
                @update:model-value="(value) => (draftState.doors = value)"
              />
              <SelectFilter
                :label="definitions.seats.label"
                :placeholder="definitions.seats.placeholder"
                :options="definitions.seats.options"
                :model-value="draftState.seats"
                @update:model-value="(value) => (draftState.seats = value)"
              />
            </div>

            <Separator class="bg-[#d6dfeb]" />

            <div class="space-y-3">
              <div>
                <h3 class="text-[20px] font-semibold text-[#2a3342]">Extras</h3>
                <p class="text-xs text-[#5f6f87]">Popular + Suche</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in popularExtraOptions"
                  :key="`popular-${option.id}`"
                  type="button"
                  class="rounded-full border px-2.5 py-1 text-xs transition"
                  :class="
                    draftState.extras.includes(option.value)
                      ? 'border-[#3f82f6] bg-[#e7eef8] text-[#1d2a3f]'
                      : 'border-[#c3cfdd] bg-white text-[#2a3342] hover:bg-[#eef3fb]'
                  "
                  @click="toggleExtra(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>

              <div class="relative w-full items-center">
                <Input
                  :model-value="extrasSearch"
                  class="w-full pl-9"
                  placeholder="Extras suchen"
                  @update:model-value="
                    (value) => (extrasSearch = String(value))
                  "
                />
                <span
                  class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3"
                >
                  <Search class="size-4 text-muted-foreground" />
                </span>
              </div>

              <div
                class="max-h-[240px] overflow-y-auto rounded-lg border border-[#d3dbe7] bg-white p-1"
              >
                <button
                  v-for="option in filteredExtraOptions"
                  :key="`extra-${option.id}`"
                  type="button"
                  class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#f1f5fb]"
                  @click="toggleExtra(option.value)"
                >
                  <span class="text-[#2a3342]">{{ option.label }}</span>
                  <span
                    class="inline-flex h-4 w-4 items-center justify-center rounded border text-xs"
                    :class="
                      draftState.extras.includes(option.value)
                        ? 'border-[#3f82f6] bg-[#3f82f6] text-white'
                        : 'border-[#c3cfdd] text-transparent'
                    "
                  >
                    ✓
                  </span>
                </button>
                <p
                  v-if="filteredExtraOptions.length === 0"
                  class="px-2 py-2 text-xs text-[#90a0b7]"
                >
                  Keine passenden Extras.
                </p>
              </div>
            </div>
          </section>
        </div>
      </Tabs>

      <DialogFooter
        class="border-t border-[#d6dfeb] bg-[#f7f9fc] px-5 py-4 sm:justify-between"
      >
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            :disabled="!canGoBack"
            class="border-[#c3cfdd] bg-white text-[#2a3342]"
            @click="goBack"
          >
            Zurück
          </Button>
          <Button
            v-if="canSkip"
            variant="ghost"
            class="text-[#2a3342]"
            @click="skipStep"
          >
            Ueberspringen
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            class="text-[#2a3342]"
            @click="emit('update:open', false)"
          >
            Abbrechen
          </Button>
          <Button
            v-if="!isLastStep"
            class="bg-[#3f82f6] text-white hover:bg-[#2d72e8]"
            :disabled="!canGoNext"
            @click="goNext"
          >
            Weiter
          </Button>
          <Button
            v-else
            class="bg-[#3f82f6] text-white hover:bg-[#2d72e8]"
            :disabled="!canGoNext"
            @click="applyAndClose"
          >
            Filter anwenden
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
