<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, ChevronsUpDown, Search, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface FilterOption {
  id: string
  label: string
  value: string
}

type FilterKind =
  | 'category'
  | 'make'
  | 'model'
  | 'bodyType'
  | 'fuel'
  | 'transmission'
  | 'condition'
  | 'financing'
  | 'doors'
  | 'seats'
  | 'extra'
  | 'yearFrom'
  | 'yearTo'
  | 'kilometerFrom'
  | 'kilometerTo'
  | 'priceMin'
  | 'priceMax'

interface AppliedFilter {
  id: string
  label: string
  kind: FilterKind
  value: string
}

const makeOptions: FilterOption[] = [
  { id: 'make-audi', label: 'Audi', value: 'Audi' },
  { id: 'make-bmw', label: 'BMW', value: 'BMW' },
  { id: 'make-mercedes', label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { id: 'make-skoda', label: 'Skoda', value: 'Skoda' },
  { id: 'make-volkswagen', label: 'Volkswagen', value: 'Volkswagen' }
]

const modelOptions: FilterOption[] = [
  { id: 'model-3-series', label: '3 Series', value: '3 Series' },
  { id: 'model-a1', label: 'A1', value: 'A1' },
  { id: 'model-enyaq', label: 'Enyaq', value: 'Enyaq' },
  { id: 'model-glc', label: 'GLC', value: 'GLC' },
  { id: 'model-tiguan', label: 'Tiguan', value: 'Tiguan' }
]

const categoryOptions: FilterOption[] = [
  { id: 'category-car', label: 'PKW', value: 'PKW' },
  { id: 'category-motorcycle', label: 'Motorrad', value: 'Motorrad' },
  { id: 'category-van', label: 'Transporter', value: 'Transporter' },
  { id: 'category-camper', label: 'Wohnmobil', value: 'Wohnmobil' },
  { id: 'category-truck', label: 'LKW', value: 'LKW' }
]

const bodyTypeOptions: FilterOption[] = [
  { id: 'body-suv', label: 'SUV', value: 'SUV' },
  { id: 'body-limousine', label: 'Limousine', value: 'Limousine' },
  { id: 'body-kombi', label: 'Kombi', value: 'Kombi' },
  { id: 'body-coupe', label: 'Coupe', value: 'Coupe' },
  { id: 'body-cabrio', label: 'Cabrio', value: 'Cabrio' }
]

const fuelOptions: FilterOption[] = [
  { id: 'fuel-benzin', label: 'Benzin', value: 'Benzin' },
  { id: 'fuel-diesel', label: 'Diesel', value: 'Diesel' },
  { id: 'fuel-hybrid', label: 'Hybrid', value: 'Hybrid' },
  { id: 'fuel-elektro', label: 'Elektro', value: 'Elektro' },
  { id: 'fuel-lpg', label: 'LPG', value: 'LPG' }
]

const transmissionOptions: FilterOption[] = [
  { id: 'transmission-automatic', label: 'Automatik', value: 'Automatik' },
  { id: 'transmission-manual', label: 'Schaltgetriebe', value: 'Schaltgetriebe' }
]

const conditionOptions: FilterOption[] = [
  { id: 'condition-new', label: 'Neu', value: 'Neu' },
  { id: 'condition-used', label: 'Gebraucht', value: 'Gebraucht' },
  { id: 'condition-demo', label: 'Vorfuehrfahrzeug', value: 'Vorfuehrfahrzeug' },
  { id: 'condition-yearly', label: 'Jahreswagen', value: 'Jahreswagen' }
]

const financingOptions: FilterOption[] = [
  { id: 'financing-leasing', label: 'Leasing', value: 'Leasing' },
  { id: 'financing-abo', label: 'Abo', value: 'Abo' },
  { id: 'financing-kredit', label: 'Kredit', value: 'Kredit' },
  { id: 'financing-ratenkauf', label: 'Ratenkauf', value: 'Ratenkauf' },
  { id: 'financing-ballon', label: 'Ballonfinanzierung', value: 'Ballonfinanzierung' }
]

const currentYear = new Date().getFullYear()
const yearOptions: FilterOption[] = Array.from({ length: currentYear - 1979 }, (_, index) => {
  const year = String(currentYear - index)
  return { id: `year-${year}`, label: year, value: year }
})

const kilometerOptions: FilterOption[] = [
  '0',
  '5000',
  '10000',
  '20000',
  '30000',
  '40000',
  '50000',
  '75000',
  '100000',
  '125000',
  '150000',
  '200000',
  '250000'
].map((value) => ({ id: `kilometer-${value}`, label: value, value }))

const seatOptions: FilterOption[] = [
  { id: 'seats-2', label: '2 Sitze', value: '2' },
  { id: 'seats-4', label: '4 Sitze', value: '4' },
  { id: 'seats-5', label: '5 Sitze', value: '5' },
  { id: 'seats-6', label: '6 Sitze', value: '6' },
  { id: 'seats-7', label: '7 Sitze', value: '7' },
  { id: 'seats-8', label: '8 Sitze', value: '8' },
  { id: 'seats-9', label: '9 Sitze', value: '9' }
]

const doorOptions: FilterOption[] = [
  { id: 'doors-2-3', label: '2/3', value: '2/3' },
  { id: 'doors-4-5', label: '4/5', value: '4/5' },
  { id: 'doors-6plus', label: '6+', value: '6+' }
]

const extraOptions: FilterOption[] = [
  { id: 'extra-klimaanlage', label: 'Klimaanlage', value: 'Klimaanlage' },
  { id: 'extra-klimaautomatik', label: 'Klimaautomatik', value: 'Klimaautomatik' },
  { id: 'extra-sitzheizung', label: 'Sitzheizung', value: 'Sitzheizung' },
  { id: 'extra-sitzbelueftung', label: 'Sitzbelueftung', value: 'Sitzbelueftung' },
  { id: 'extra-lederscheinwerfer', label: 'LED-Scheinwerfer', value: 'LED-Scheinwerfer' },
  { id: 'extra-xenon', label: 'Xenon', value: 'Xenon' },
  { id: 'extra-adaptives-licht', label: 'Adaptives Licht', value: 'Adaptives Licht' },
  { id: 'extra-navi', label: 'Navigationssystem', value: 'Navigationssystem' },
  { id: 'extra-apple-carplay', label: 'Apple CarPlay', value: 'Apple CarPlay' },
  { id: 'extra-android-auto', label: 'Android Auto', value: 'Android Auto' },
  { id: 'extra-bluetooth', label: 'Bluetooth', value: 'Bluetooth' },
  { id: 'extra-dab', label: 'DAB Radio', value: 'DAB Radio' },
  { id: 'extra-tempomat', label: 'Tempomat', value: 'Tempomat' },
  { id: 'extra-adaptiver-tempomat', label: 'Adaptiver Tempomat', value: 'Adaptiver Tempomat' },
  { id: 'extra-spurhalteassistent', label: 'Spurhalteassistent', value: 'Spurhalteassistent' },
  { id: 'extra-totwinkelassistent', label: 'Totwinkelassistent', value: 'Totwinkelassistent' },
  { id: 'extra-notbremsassistent', label: 'Notbremsassistent', value: 'Notbremsassistent' },
  { id: 'extra-einparkhilfe', label: 'Einparkhilfe', value: 'Einparkhilfe' },
  { id: 'extra-rueckfahrkamera', label: 'Rueckfahrkamera', value: 'Rueckfahrkamera' },
  { id: 'extra-360-kamera', label: '360 Kamera', value: '360 Kamera' },
  { id: 'extra-panorama', label: 'Panoramadach', value: 'Panoramadach' },
  { id: 'extra-ahk', label: 'Anhaengerkupplung', value: 'Anhaengerkupplung' },
  { id: 'extra-allrad', label: 'Allradantrieb', value: 'Allradantrieb' },
  { id: 'extra-sportsitze', label: 'Sportsitze', value: 'Sportsitze' },
  { id: 'extra-leder', label: 'Lederausstattung', value: 'Lederausstattung' },
  { id: 'extra-keyless', label: 'Keyless Entry', value: 'Keyless Entry' }
]

const minPrice = ref('')
const maxPrice = ref('')
const selectedCategory = ref<string | undefined>('PKW')
const selectedMakes = ref<string[]>(['Audi', 'BMW'])
const selectedModels = ref<string[]>(['3 Series', 'A1'])
const selectedBodyTypes = ref<string[]>(['SUV'])
const selectedFuels = ref<string[]>(['Benzin'])
const selectedTransmission = ref<string | undefined>()
const selectedCondition = ref<string | undefined>()
const selectedFinancing = ref<string[]>([])
const yearFrom = ref<string | undefined>()
const yearTo = ref<string | undefined>()
const kilometerFrom = ref<string | undefined>()
const kilometerTo = ref<string | undefined>()
const selectedDoors = ref<string | undefined>()
const selectedSeats = ref<string | undefined>()
const selectedExtras = ref<string[]>([])
const extrasSearchQuery = ref('')
const isExtrasDialogOpen = ref(false)

const maxKilometerValue = kilometerOptions[kilometerOptions.length - 1]?.value ?? '250000'

const yearToOptions = computed<FilterOption[]>(() => {
  if (!yearFrom.value) {
    return yearOptions
  }

  const yearFromNumber = Number(yearFrom.value)
  return yearOptions.filter((option) => Number(option.value) >= yearFromNumber)
})

const kilometerToOptions = computed<FilterOption[]>(() => {
  if (!kilometerFrom.value) {
    return kilometerOptions
  }

  if (kilometerFrom.value === maxKilometerValue) {
    return []
  }

  const kilometerFromNumber = Number(kilometerFrom.value)
  return kilometerOptions.filter((option) => Number(option.value) >= kilometerFromNumber)
})

const isKilometerToDisabled = computed<boolean>(() => kilometerToOptions.value.length === 0)

const filteredExtraOptions = computed<FilterOption[]>(() => {
  const normalizedSearch = extrasSearchQuery.value.trim().toLowerCase()
  if (!normalizedSearch) {
    return extraOptions
  }

  return extraOptions.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
})

const props = defineProps<{
  hostElement?: HTMLElement | null
}>()

const resultsHostRef = ref<HTMLDivElement | null>(null)
const hasExternalResults = ref(false)
let resultsElement: HTMLElement | null = null

const appliedFilters = computed<AppliedFilter[]>(() => {
  const filters: AppliedFilter[] = []

  if (selectedCategory.value) {
    filters.push({
      id: `category-${selectedCategory.value}`,
      label: `Kategorie: ${selectedCategory.value}`,
      kind: 'category',
      value: selectedCategory.value
    })
  }

  for (const selectedMake of selectedMakes.value) {
    filters.push({
      id: `make-${selectedMake}`,
      label: `Marke: ${selectedMake}`,
      kind: 'make',
      value: selectedMake
    })
  }

  for (const selectedModel of selectedModels.value) {
    filters.push({
      id: `model-${selectedModel}`,
      label: `Model: ${selectedModel}`,
      kind: 'model',
      value: selectedModel
    })
  }

  for (const selectedBodyType of selectedBodyTypes.value) {
    filters.push({
      id: `bodyType-${selectedBodyType}`,
      label: `Karosserietyp: ${selectedBodyType}`,
      kind: 'bodyType',
      value: selectedBodyType
    })
  }

  for (const selectedFuel of selectedFuels.value) {
    filters.push({
      id: `fuel-${selectedFuel}`,
      label: `Kraftstoff: ${selectedFuel}`,
      kind: 'fuel',
      value: selectedFuel
    })
  }

  if (selectedTransmission.value) {
    filters.push({
      id: `transmission-${selectedTransmission.value}`,
      label: `Schaltung: ${selectedTransmission.value}`,
      kind: 'transmission',
      value: selectedTransmission.value
    })
  }

  if (selectedCondition.value) {
    filters.push({
      id: `condition-${selectedCondition.value}`,
      label: `Fahrzeugzustand: ${selectedCondition.value}`,
      kind: 'condition',
      value: selectedCondition.value
    })
  }

  for (const selectedFinancingOption of selectedFinancing.value) {
    filters.push({
      id: `financing-${selectedFinancingOption}`,
      label: `Finanzierung: ${selectedFinancingOption}`,
      kind: 'financing',
      value: selectedFinancingOption
    })
  }

  if (yearFrom.value) {
    filters.push({
      id: 'year-from',
      label: `Baujahr von: ${yearFrom.value}`,
      kind: 'yearFrom',
      value: yearFrom.value
    })
  }

  if (yearTo.value) {
    filters.push({
      id: 'year-to',
      label: `Baujahr bis: ${yearTo.value}`,
      kind: 'yearTo',
      value: yearTo.value
    })
  }

  if (kilometerFrom.value) {
    filters.push({
      id: 'kilometer-from',
      label: `Kilometer von: ${kilometerFrom.value}`,
      kind: 'kilometerFrom',
      value: kilometerFrom.value
    })
  }

  if (kilometerTo.value) {
    filters.push({
      id: 'kilometer-to',
      label: `Kilometer bis: ${kilometerTo.value}`,
      kind: 'kilometerTo',
      value: kilometerTo.value
    })
  }

  if (selectedDoors.value) {
    filters.push({
      id: `doors-${selectedDoors.value}`,
      label: `Tueren: ${selectedDoors.value}`,
      kind: 'doors',
      value: selectedDoors.value
    })
  }

  if (selectedSeats.value) {
    filters.push({
      id: `seats-${selectedSeats.value}`,
      label: `Sitze: ${selectedSeats.value}`,
      kind: 'seats',
      value: selectedSeats.value
    })
  }

  for (const selectedExtra of selectedExtras.value) {
    filters.push({
      id: `extra-${selectedExtra}`,
      label: `Extra: ${selectedExtra}`,
      kind: 'extra',
      value: selectedExtra
    })
  }

  const normalizedMinPrice = minPrice.value.trim()
  if (normalizedMinPrice) {
    filters.push({
      id: 'price-min',
      label: `Min: ${normalizedMinPrice} €`,
      kind: 'priceMin',
      value: normalizedMinPrice
    })
  }

  const normalizedMaxPrice = maxPrice.value.trim()
  if (normalizedMaxPrice) {
    filters.push({
      id: 'price-max',
      label: `Max: ${normalizedMaxPrice} €`,
      kind: 'priceMax',
      value: normalizedMaxPrice
    })
  }

  return filters
})

function sanitizeNumericInput(value: string | number): string {
  return String(value).replace(/\D+/g, '')
}

function setMinPrice(value: string | number): void {
  minPrice.value = sanitizeNumericInput(value)
}

function setMaxPrice(value: string | number): void {
  maxPrice.value = sanitizeNumericInput(value)
}

function handlePriceKeydown(event: KeyboardEvent): void {
  const allowedNavigationKeys = new Set([
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End'
  ])

  const isShortcut = (event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())
  if (allowedNavigationKeys.has(event.key) || isShortcut) {
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

function handlePricePaste(event: ClipboardEvent): void {
  const pastedText = event.clipboardData?.getData('text') ?? ''
  if (/^\d*$/.test(pastedText)) {
    return
  }

  event.preventDefault()
}

function removeAppliedFilter(filter: AppliedFilter): void {
  if (filter.kind === 'category') {
    selectedCategory.value = undefined
    return
  }

  if (filter.kind === 'make') {
    selectedMakes.value = selectedMakes.value.filter((make) => make !== filter.value)
    return
  }

  if (filter.kind === 'model') {
    selectedModels.value = selectedModels.value.filter((model) => model !== filter.value)
    return
  }

  if (filter.kind === 'bodyType') {
    selectedBodyTypes.value = selectedBodyTypes.value.filter((bodyType) => bodyType !== filter.value)
    return
  }

  if (filter.kind === 'fuel') {
    selectedFuels.value = selectedFuels.value.filter((fuel) => fuel !== filter.value)
    return
  }

  if (filter.kind === 'transmission') {
    selectedTransmission.value = undefined
    return
  }

  if (filter.kind === 'condition') {
    selectedCondition.value = undefined
    return
  }

  if (filter.kind === 'financing') {
    selectedFinancing.value = selectedFinancing.value.filter((item) => item !== filter.value)
    return
  }

  if (filter.kind === 'yearFrom') {
    yearFrom.value = undefined
    return
  }

  if (filter.kind === 'yearTo') {
    yearTo.value = undefined
    return
  }

  if (filter.kind === 'kilometerFrom') {
    kilometerFrom.value = undefined
    return
  }

  if (filter.kind === 'kilometerTo') {
    kilometerTo.value = undefined
    return
  }

  if (filter.kind === 'seats') {
    selectedSeats.value = undefined
    return
  }

  if (filter.kind === 'doors') {
    selectedDoors.value = undefined
    return
  }

  if (filter.kind === 'extra') {
    selectedExtras.value = selectedExtras.value.filter((extra) => extra !== filter.value)
    return
  }

  if (filter.kind === 'priceMin') {
    minPrice.value = ''
    return
  }

  maxPrice.value = ''
}

function clearMakeFilters(): void {
  selectedMakes.value = []
}

function clearCategoryFilters(): void {
  selectedCategory.value = undefined
}

function removeSelectedMake(make: string): void {
  selectedMakes.value = selectedMakes.value.filter((item) => item !== make)
}

function clearModelFilters(): void {
  selectedModels.value = []
}

function removeSelectedModel(model: string): void {
  selectedModels.value = selectedModels.value.filter((item) => item !== model)
}

function removeSelectedBodyType(bodyType: string): void {
  selectedBodyTypes.value = selectedBodyTypes.value.filter((item) => item !== bodyType)
}

function removeSelectedFuel(fuel: string): void {
  selectedFuels.value = selectedFuels.value.filter((item) => item !== fuel)
}

function removeSelectedFinancing(financing: string): void {
  selectedFinancing.value = selectedFinancing.value.filter((item) => item !== financing)
}

function clearBodyTypeFilters(): void {
  selectedBodyTypes.value = []
}

function clearFuelFilters(): void {
  selectedFuels.value = []
}

function clearBudgetFilters(): void {
  minPrice.value = ''
  maxPrice.value = ''
}

function clearTransmissionFilter(): void {
  selectedTransmission.value = undefined
}

function clearConditionFilter(): void {
  selectedCondition.value = undefined
}

function clearFinancingFilters(): void {
  selectedFinancing.value = []
}

function clearYearFilters(): void {
  yearFrom.value = undefined
  yearTo.value = undefined
}

function clearKilometerFilters(): void {
  kilometerFrom.value = undefined
  kilometerTo.value = undefined
}

function clearSeatFilter(): void {
  selectedSeats.value = undefined
}

function clearDoorFilter(): void {
  selectedDoors.value = undefined
}

function clearExtraFilters(): void {
  selectedExtras.value = []
}

watch(yearFrom, (nextFrom) => {
  if (!nextFrom || !yearTo.value) {
    return
  }

  if (Number(yearTo.value) < Number(nextFrom)) {
    yearTo.value = undefined
  }
})

watch(kilometerFrom, (nextFrom) => {
  if (!nextFrom) {
    return
  }

  if (nextFrom === maxKilometerValue) {
    kilometerTo.value = undefined
    return
  }

  if (!kilometerTo.value) {
    return
  }

  if (Number(kilometerTo.value) < Number(nextFrom)) {
    kilometerTo.value = undefined
  }
})

function clearAllFilters(): void {
  selectedCategory.value = undefined
  selectedMakes.value = []
  selectedModels.value = []
  selectedBodyTypes.value = []
  selectedFuels.value = []
  selectedTransmission.value = undefined
  selectedCondition.value = undefined
  selectedFinancing.value = []
  yearFrom.value = undefined
  yearTo.value = undefined
  kilometerFrom.value = undefined
  kilometerTo.value = undefined
  selectedDoors.value = undefined
  selectedSeats.value = undefined
  selectedExtras.value = []
  minPrice.value = ''
  maxPrice.value = ''
}

function resolveResultsElement(): HTMLElement | null {
  if (resultsElement) {
    return resultsElement
  }

  if (!props.hostElement) {
    return null
  }

  for (const child of Array.from(props.hostElement.children)) {
    if (child.tagName.toLowerCase() === 'custom-elements-wrapper') {
      resultsElement = child as HTMLElement
      break
    }
  }

  return resultsElement
}

function mountResultsChild(): void {
  const host = resultsHostRef.value
  const child = resolveResultsElement()

  if (!host || !child) {
    hasExternalResults.value = false
    return
  }

  host.appendChild(child)
  hasExternalResults.value = true
}

onMounted(() => {
  mountResultsChild()
})

onBeforeUnmount(() => {
  if (!props.hostElement || !resultsElement) {
    return
  }

  props.hostElement.insertBefore(resultsElement, props.hostElement.firstChild)
  hasExternalResults.value = false
})
</script>

<template>
  <section class="mx-auto w-full max-w-[1180px] rounded-2xl border border-[#cfd9e6] bg-[#f4f6f9] p-4 shadow-sm">
    <div class="mb-6">
      <h2 class="text-[40px] leading-none font-semibold text-[#202735]"></h2>
      <h1 class="text-[36px] leading-[0.9] font-semibold tracking-[-0.03em] text-[#202735]">
        Digital 35 - Challenge
      </h1>
    </div>

    <Card class="border-[#c8d2de] bg-[#f7f9fc] shadow-none">
      <CardHeader class="gap-4 p-4">
        <div>
          <CardTitle class="text-[2rem] leading-[0.95] text-[#2a3342]">Search &amp; Filter</CardTitle>
          <CardDescription class="mt-2 text-sm leading-6 text-[#5f6f87]">
            Standalone Filter UI.
          </CardDescription>
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

          <CardContent class="p-4 pt-0">
            <div class="w-full">
              <div class="w-full space-y-4">
                <Card class="border-[#c3cfdd] bg-[#f7f9fc] shadow-none">
                  <CardHeader class="p-3 pb-2">
                    <div class="flex items-center justify-between">
                      <h3 class=" text-[20px] font-semibold text-[#2a3342] ">Budget</h3>
                      <Button
                        v-if="minPrice || maxPrice"
                        variant="ghost"
                        size="sm"
                        class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                        @click="clearBudgetFilters"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent class="space-y-3 p-3 pt-0">
                    <div class="grid grid-cols-2 gap-2">
                      <Input
                        :model-value="minPrice"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        autocomplete="off"
                        placeholder="Von €"
                        @keydown="handlePriceKeydown"
                        @paste="handlePricePaste"
                        @update:model-value="setMinPrice"
                      />
                      <Input
                        :model-value="maxPrice"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        autocomplete="off"
                        placeholder="Bis €"
                        @keydown="handlePriceKeydown"
                        @paste="handlePricePaste"
                        @update:model-value="setMaxPrice"
                      />
                    </div>

                    <div class="flex items-center justify-between">
                      <h3 class="text-[20px] font-semibold text-[#2a3342]">Finanzierungsart</h3>
                      <Button
                        v-if="selectedFinancing.length > 0"
                        variant="ghost"
                        size="sm"
                        class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                        @click="clearFinancingFilters"
                      >
                        Clear
                      </Button>
                    </div>
                    <Combobox
                      v-model="selectedFinancing"
                      multiple
                      :open-on-focus="true"
                      :open-on-click="true"
                    >
                      <ComboboxAnchor class="w-full">
                        <div class="relative w-full items-center">
                          <ComboboxInput
                            class="w-full pl-9 pr-9"
                            placeholder="Finanzierung suchen"
                          />
                          <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                            <Search class="size-4 text-muted-foreground" />
                          </span>
                          <ComboboxTrigger class="absolute end-0 inset-y-0 flex items-center justify-center px-3">
                            <ChevronsUpDown class="size-4 text-muted-foreground" />
                          </ComboboxTrigger>
                        </div>
                      </ComboboxAnchor>

                      <ComboboxList class="w-[--reka-popper-anchor-width]">
                        <ComboboxEmpty>Keine passende Finanzierungsart.</ComboboxEmpty>
                        <ComboboxGroup>
                          <ComboboxItem
                            v-for="option in financingOptions"
                            :key="option.id"
                            :value="option.value"
                          >
                            {{ option.label }}
                            <ComboboxItemIndicator>
                              <Check class="size-4" />
                            </ComboboxItemIndicator>
                          </ComboboxItem>
                        </ComboboxGroup>
                      </ComboboxList>
                    </Combobox>

                    <div v-if="selectedFinancing.length > 0" class="flex flex-wrap gap-2">
                      <Badge
                        v-for="financing in selectedFinancing"
                        :key="`selected-financing-${financing}`"
                        variant="secondary"
                        class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                      >
                        {{ financing }}
                        <button
                          type="button"
                          class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                          @click="removeSelectedFinancing(financing)"
                        >
                          <X class="size-3 text-[#6f8099]" />
                        </button>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card class="border-[#c3cfdd] bg-[#f7f9fc] shadow-none">
                  <CardHeader class="p-3 pb-2">
                    <CardTitle class="text-[26px] leading-none tracking-[-0.02em] text-[#2a3342]">
                      Fahrzeugdetails
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-4 p-3 pt-0">
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Kategorie</h3>
                        <Button
                          v-if="selectedCategory"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearCategoryFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <Select v-model="selectedCategory">
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="option in categoryOptions"
                            :key="option.id"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Marke</h3>
                        <Button
                          v-if="selectedMakes.length > 0"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearMakeFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <Combobox
                        v-model="selectedMakes"
                        multiple
                        :open-on-focus="true"
                        :open-on-click="true"
                      >
                        <ComboboxAnchor class="w-full">
                          <div class="relative w-full items-center">
                            <ComboboxInput
                              class="w-full pl-9 pr-9"
                              placeholder="Marke suchen"
                            />
                            <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                              <Search class="size-4 text-muted-foreground" />
                            </span>
                            <ComboboxTrigger class="absolute end-0 inset-y-0 flex items-center justify-center px-3">
                              <ChevronsUpDown class="size-4 text-muted-foreground" />
                            </ComboboxTrigger>
                          </div>
                        </ComboboxAnchor>

                        <ComboboxList class="w-[--reka-popper-anchor-width]">
                          <ComboboxEmpty>Keine passende Marke.</ComboboxEmpty>
                          <ComboboxGroup>
                            <ComboboxItem
                              v-for="option in makeOptions"
                              :key="option.id"
                              :value="option.value"
                            >
                              {{ option.label }}
                              <ComboboxItemIndicator>
                                <Check class="size-4" />
                              </ComboboxItemIndicator>
                            </ComboboxItem>
                          </ComboboxGroup>
                        </ComboboxList>
                      </Combobox>

                      <div v-if="selectedMakes.length > 0" class="flex flex-wrap gap-2">
                        <Badge
                          v-for="make in selectedMakes"
                          :key="`selected-make-${make}`"
                          variant="secondary"
                          class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                        >
                          {{ make }}
                          <button
                            type="button"
                            class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                            @click="removeSelectedMake(make)"
                          >
                            <X class="size-3 text-[#6f8099]" />
                          </button>
                        </Badge>
                      </div>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Model</h3>
                        <Button
                          v-if="selectedModels.length > 0"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearModelFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <Combobox
                        v-model="selectedModels"
                        multiple
                        :open-on-focus="true"
                        :open-on-click="true"
                      >
                        <ComboboxAnchor class="w-full">
                          <div class="relative w-full items-center">
                            <ComboboxInput
                              class="w-full pl-9 pr-9"
                              placeholder="Model suchen"
                            />
                            <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                              <Search class="size-4 text-muted-foreground" />
                            </span>
                            <ComboboxTrigger class="absolute end-0 inset-y-0 flex items-center justify-center px-3">
                              <ChevronsUpDown class="size-4 text-muted-foreground" />
                            </ComboboxTrigger>
                          </div>
                        </ComboboxAnchor>

                        <ComboboxList class="w-[--reka-popper-anchor-width]">
                          <ComboboxEmpty>Kein passendes Model.</ComboboxEmpty>
                          <ComboboxGroup>
                            <ComboboxItem
                              v-for="option in modelOptions"
                              :key="option.id"
                              :value="option.value"
                            >
                              {{ option.label }}
                              <ComboboxItemIndicator>
                                <Check class="size-4" />
                              </ComboboxItemIndicator>
                            </ComboboxItem>
                          </ComboboxGroup>
                        </ComboboxList>
                      </Combobox>

                      <div v-if="selectedModels.length > 0" class="flex flex-wrap gap-2">
                        <Badge
                          v-for="model in selectedModels"
                          :key="`selected-model-${model}`"
                          variant="secondary"
                          class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                        >
                          {{ model }}
                          <button
                            type="button"
                            class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                            @click="removeSelectedModel(model)"
                          >
                            <X class="size-3 text-[#6f8099]" />
                          </button>
                        </Badge>
                      </div>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Karosserietyp</h3>
                        <Button
                          v-if="selectedBodyTypes.length > 0"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearBodyTypeFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <Combobox
                        v-model="selectedBodyTypes"
                        multiple
                        :open-on-focus="true"
                        :open-on-click="true"
                      >
                        <ComboboxAnchor class="w-full">
                          <div class="relative w-full items-center">
                            <ComboboxInput
                              class="w-full pl-9 pr-9"
                              placeholder="Karosserietyp suchen"
                            />
                            <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                              <Search class="size-4 text-muted-foreground" />
                            </span>
                            <ComboboxTrigger class="absolute end-0 inset-y-0 flex items-center justify-center px-3">
                              <ChevronsUpDown class="size-4 text-muted-foreground" />
                            </ComboboxTrigger>
                          </div>
                        </ComboboxAnchor>

                        <ComboboxList class="w-[--reka-popper-anchor-width]">
                          <ComboboxEmpty>Kein passender Karosserietyp.</ComboboxEmpty>
                          <ComboboxGroup>
                            <ComboboxItem
                              v-for="option in bodyTypeOptions"
                              :key="option.id"
                              :value="option.value"
                            >
                              {{ option.label }}
                              <ComboboxItemIndicator>
                                <Check class="size-4" />
                              </ComboboxItemIndicator>
                            </ComboboxItem>
                          </ComboboxGroup>
                        </ComboboxList>
                      </Combobox>

                      <div v-if="selectedBodyTypes.length > 0" class="flex flex-wrap gap-2">
                        <Badge
                          v-for="bodyType in selectedBodyTypes"
                          :key="`selected-body-type-${bodyType}`"
                          variant="secondary"
                          class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                        >
                          {{ bodyType }}
                          <button
                            type="button"
                            class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                            @click="removeSelectedBodyType(bodyType)"
                          >
                            <X class="size-3 text-[#6f8099]" />
                          </button>
                        </Badge>
                      </div>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />
                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Kraftstoff</h3>
                        <Button
                          v-if="selectedFuels.length > 0"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearFuelFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <Combobox
                        v-model="selectedFuels"
                        multiple
                        :open-on-focus="true"
                        :open-on-click="true"
                      >
                        <ComboboxAnchor class="w-full">
                          <div class="relative w-full items-center">
                            <ComboboxInput
                              class="w-full pl-9 pr-9"
                              placeholder="Kraftstoff suchen"
                            />
                            <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                              <Search class="size-4 text-muted-foreground" />
                            </span>
                            <ComboboxTrigger class="absolute end-0 inset-y-0 flex items-center justify-center px-3">
                              <ChevronsUpDown class="size-4 text-muted-foreground" />
                            </ComboboxTrigger>
                          </div>
                        </ComboboxAnchor>

                        <ComboboxList class="w-[--reka-popper-anchor-width]">
                          <ComboboxEmpty>Kein passender Kraftstoff.</ComboboxEmpty>
                          <ComboboxGroup>
                            <ComboboxItem
                              v-for="option in fuelOptions"
                              :key="option.id"
                              :value="option.value"
                            >
                              {{ option.label }}
                              <ComboboxItemIndicator>
                                <Check class="size-4" />
                              </ComboboxItemIndicator>
                            </ComboboxItem>
                          </ComboboxGroup>
                        </ComboboxList>
                      </Combobox>

                      <div v-if="selectedFuels.length > 0" class="flex flex-wrap gap-2">
                        <Badge
                          v-for="fuel in selectedFuels"
                          :key="`selected-fuel-${fuel}`"
                          variant="secondary"
                          class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                        >
                          {{ fuel }}
                          <button
                            type="button"
                            class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                            @click="removeSelectedFuel(fuel)"
                          >
                            <X class="size-3 text-[#6f8099]" />
                          </button>
                        </Badge>
                      </div>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Schaltung</h3>
                        <Button
                          v-if="selectedTransmission"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearTransmissionFilter"
                        >
                          Clear
                        </Button>
                      </div>
                      <Select v-model="selectedTransmission">
                        <SelectTrigger>
                          <SelectValue placeholder="Schaltung wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="option in transmissionOptions"
                            :key="option.id"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Erstzulassung</h3>
                        <Button
                          v-if="yearFrom || yearTo"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearYearFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <Select v-model="yearFrom">
                          <SelectTrigger>
                            <SelectValue placeholder="Von" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="option in yearOptions"
                              :key="`year-from-${option.id}`"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select v-model="yearTo">
                          <SelectTrigger>
                            <SelectValue placeholder="Bis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="option in yearToOptions"
                              :key="`year-to-${option.id}`"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Kilometer</h3>
                        <Button
                          v-if="kilometerFrom || kilometerTo"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearKilometerFilters"
                        >
                          Clear
                        </Button>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <Select v-model="kilometerFrom">
                          <SelectTrigger>
                            <SelectValue placeholder="Von" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="option in kilometerOptions"
                              :key="`kilometer-from-${option.id}`"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          v-model="kilometerTo"
                          :disabled="isKilometerToDisabled"
                        >
                          <SelectTrigger>
                            <SelectValue :placeholder="isKilometerToDisabled ? 'Nicht verfuegbar' : 'Bis'" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="option in kilometerToOptions"
                              :key="`kilometer-to-${option.id}`"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <h3 class="text-[20px] font-semibold text-[#2a3342]">Fahrzeugzustand</h3>
                        <Button
                          v-if="selectedCondition"
                          variant="ghost"
                          size="sm"
                          class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                          @click="clearConditionFilter"
                        >
                          Clear
                        </Button>
                      </div>
                      <Select v-model="selectedCondition">
                        <SelectTrigger>
                          <SelectValue placeholder="Zustand wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="option in conditionOptions"
                            :key="option.id"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator class="bg-[#d6dfeb]" />

                    <div class="space-y-1">
                      <Button
                        variant="ghost"
                        class="h-9 justify-start px-2 text-[15px] text-[#1e2736] hover:bg-[#e9edf3]"
                        @click="isExtrasDialogOpen = true"
                      >
                        Auto extras konfigurieren
                      </Button>
                      <p class="text-xs text-[#5f6f87]">
                        {{
                          selectedDoors || selectedSeats || selectedExtras.length > 0
                            ? `${selectedDoors ? `Tueren: ${selectedDoors}` : 'Tueren: -'} | ${selectedSeats ? `Sitze: ${selectedSeats}` : 'Sitze: -'} | ${selectedExtras.length} Extras gewaehlt`
                            : 'Noch keine Extras ausgewaehlt'
                        }}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                
              </div>
            </div>
          </CardContent>
        </Card>

          <div class="space-y-4">
            <Card class="w-full border-[#c8d2de] bg-[#f7f9fc] shadow-none">
              <CardHeader class="flex-row items-center justify-between p-4 pb-3">
                <CardTitle class="text-[22px] leading-none text-[#2a3342]">Applied filters</CardTitle>
                <Button
                  v-if="appliedFilters.length > 0"
                  variant="ghost"
                  size="sm"
                  class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                  @click="clearAllFilters"
                >
                  Clear all
                </Button>
              </CardHeader>
              <CardContent class="p-4 pt-0">
                <div v-if="appliedFilters.length > 0" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="appliedFilter in appliedFilters"
                    :key="`applied-${appliedFilter.id}`"
                    variant="secondary"
                    class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                  >
                    {{ appliedFilter.label }}
                    <button
                      type="button"
                      class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                      @click="removeAppliedFilter(appliedFilter)"
                    >
                      <X class="size-3 text-[#6f8099]" />
                    </button>
                  </Badge>
                </div>
                <p v-else class="text-xs text-[#90a0b7]">No filters selected.</p>
              </CardContent>
            </Card>

            <Card class="w-full border-[#c8d2de] bg-[#f7f9fc] shadow-none">
              <CardHeader class="p-4 pb-3">
                <CardTitle class="text-[22px] leading-none text-[#2a3342]">Results</CardTitle>
              </CardHeader>
              <CardContent class="p-4 pt-0">
                <div ref="resultsHostRef" class="min-h-[320px] w-full"></div>
                <p v-if="!hasExternalResults" class="text-xs text-[#90a0b7]">
                  Kein custom-elements-wrapper als Child von auto-shop-filter-widget gefunden.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>

    <div
      v-if="isExtrasDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      @click.self="isExtrasDialogOpen = false"
    >
      <Card class="w-full max-w-[760px] border-[#c8d2de] bg-[#f7f9fc] shadow-xl">
        <CardHeader class="flex-row items-center justify-between p-4 pb-3">
          <CardTitle class="text-[24px] leading-none text-[#2a3342]">Auto extras</CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            class="rounded-full"
            @click="isExtrasDialogOpen = false"
          >
            <X class="size-4 text-[#2a3342]" />
          </Button>
        </CardHeader>
        <CardContent class="space-y-4 p-4 pt-0">
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-semibold text-[#2a3342]">Anzahl Tueren</h3>
              <Button
                v-if="selectedDoors"
                variant="ghost"
                size="sm"
                class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                @click="clearDoorFilter"
              >
                Clear
              </Button>
            </div>
            <Select v-model="selectedDoors">
              <SelectTrigger>
                <SelectValue placeholder="Anzahl Tueren waehlen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in doorOptions"
                  :key="option.id"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator class="bg-[#d6dfeb]" />

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-semibold text-[#2a3342]">Anzahl Sitze</h3>
              <Button
                v-if="selectedSeats"
                variant="ghost"
                size="sm"
                class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                @click="clearSeatFilter"
              >
                Clear
              </Button>
            </div>
            <Select v-model="selectedSeats">
              <SelectTrigger>
                <SelectValue placeholder="Anzahl Sitze waehlen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in seatOptions"
                  :key="option.id"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator class="bg-[#d6dfeb]" />

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-semibold text-[#2a3342]">Extras</h3>
              <Button
                v-if="selectedExtras.length > 0"
                variant="ghost"
                size="sm"
                class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
                @click="clearExtraFilters"
              >
                Clear
              </Button>
            </div>
            <div class="space-y-1">
              <div class="relative w-full items-center">
                <Input
                  :model-value="extrasSearchQuery"
                  class="w-full pl-9 pr-3"
                  placeholder="Extras suchen"
                  @update:model-value="(value) => (extrasSearchQuery = String(value))"
                />
                <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                  <Search class="size-4 text-muted-foreground" />
                </span>
              </div>

              <div class="max-h-[46vh] overflow-y-auto rounded-lg border border-[#d3dbe7] bg-white p-1">
                <button
                  v-for="option in filteredExtraOptions"
                  :key="option.id"
                  type="button"
                  class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-[#f1f5fb]"
                  @click="selectedExtras.includes(option.value) ? selectedExtras = selectedExtras.filter((item) => item !== option.value) : selectedExtras = [...selectedExtras, option.value]"
                >
                  <span class="text-sm text-[#2a3342]">{{ option.label }}</span>
                  <Check
                    class="size-4"
                    :class="selectedExtras.includes(option.value) ? 'opacity-100 text-[#2a3342]' : 'opacity-0'"
                  />
                </button>
                <p
                  v-if="filteredExtraOptions.length === 0"
                  class="px-2 py-2 text-xs text-[#90a0b7]"
                >
                  Keine Extras gefunden.
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              class="h-9 rounded-xl px-4 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
              @click="isExtrasDialogOpen = false"
            >
              Schliessen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
