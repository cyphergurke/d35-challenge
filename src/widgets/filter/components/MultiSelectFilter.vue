<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronsUpDown, Search, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
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
import type { FilterOption } from '@/widgets/filter/types/filters'
import FilterSection from '@/widgets/filter/components/FilterSection.vue'

interface Props {
  label: string
  placeholder: string
  emptyText: string
  options: FilterOption[]
  modelValue: string[]
  showChips?: boolean
  titleClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showChips: true,
  titleClass: 'text-[20px] font-semibold text-[#2a3342]'
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const selectedValues = computed<string[]>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', [...value])
})

const optionByValue = computed(() => {
  const entries = props.options.map((option) => [option.value, option.label] as const)
  return new Map<string, string>(entries)
})

function clearSelected(): void {
  emit('update:modelValue', [])
}

function removeSelected(value: string): void {
  emit(
    'update:modelValue',
    props.modelValue.filter((item) => item !== value)
  )
}
</script>

<template>
  <FilterSection
    :label="label"
    :title-class="titleClass"
    :can-clear="modelValue.length > 0"
    @clear="clearSelected"
  >
    <Combobox
      v-model="selectedValues"
      multiple
      :open-on-focus="true"
      :open-on-click="true"
    >
      <ComboboxAnchor class="w-full">
        <div class="relative w-full items-center">
          <ComboboxInput
            class="w-full pl-9 pr-9"
            :placeholder="placeholder"
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
        <ComboboxEmpty>{{ emptyText }}</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxItem
            v-for="option in options"
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

    <div
      v-if="showChips && modelValue.length > 0"
      class="flex flex-wrap gap-2"
    >
      <Badge
        v-for="value in modelValue"
        :key="`${label}-${value}`"
        variant="secondary"
        class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
      >
        {{ optionByValue.get(value) ?? value }}
        <button
          type="button"
          class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
          @click="removeSelected(value)"
        >
          <X class="size-3 text-[#6f8099]" />
        </button>
      </Badge>
    </div>
  </FilterSection>
</template>
