<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { FilterOption } from '@/widgets/filter/types/filters'
import FilterSection from '@/widgets/filter/components/FilterSection.vue'

interface Props {
  label: string
  fromLabel?: string
  toLabel?: string
  fromValue: string | undefined
  toValue: string | undefined
  fromOptions: FilterOption[]
  toOptions: FilterOption[]
  toDisabled?: boolean
  toPlaceholder?: string
  showClear?: boolean
  titleClass?: string
}

withDefaults(defineProps<Props>(), {
  fromLabel: 'Von',
  toLabel: 'Bis',
  toDisabled: false,
  toPlaceholder: 'Bis',
  showClear: true,
  titleClass: 'text-[20px] font-semibold text-[#2a3342]'
})

const emit = defineEmits<{
  (event: 'update:fromValue', value: string | undefined): void
  (event: 'update:toValue', value: string | undefined): void
  (event: 'clear'): void
}>()

function toStringOrUndefined(value: AcceptableValue): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  return String(value)
}
</script>

<template>
  <FilterSection
    :label="label"
    :title-class="titleClass"
    :can-clear="showClear && Boolean(fromValue || toValue)"
    @clear="emit('clear')"
  >
    <div class="grid grid-cols-2 gap-2">
      <Select
        :model-value="fromValue"
        @update:model-value="
          (value) => emit('update:fromValue', toStringOrUndefined(value))
        "
      >
        <SelectTrigger>
          <SelectValue :placeholder="fromLabel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in fromOptions"
            :key="`from-${option.id}`"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        :model-value="toValue"
        :disabled="toDisabled"
        @update:model-value="
          (value) => emit('update:toValue', toStringOrUndefined(value))
        "
      >
        <SelectTrigger>
          <SelectValue
            :placeholder="toDisabled ? 'Nicht verfuegbar' : toPlaceholder"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in toOptions"
            :key="`to-${option.id}`"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </FilterSection>
</template>
