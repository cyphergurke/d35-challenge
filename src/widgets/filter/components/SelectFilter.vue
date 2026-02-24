<script setup lang="ts">
import { computed } from 'vue'
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
  placeholder: string
  options: FilterOption[]
  modelValue: string | undefined
  titleClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  titleClass: 'text-[20px] font-semibold text-[#2a3342]'
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | undefined): void
}>()

const selectedValue = computed<string | undefined>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function clearSelected(): void {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <FilterSection
    :label="label"
    :title-class="titleClass"
    :can-clear="Boolean(modelValue)"
    @clear="clearSelected"
  >
    <Select v-model="selectedValue">
      <SelectTrigger>
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in options"
          :key="option.id"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FilterSection>
</template>
