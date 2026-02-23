<script setup lang="ts">
import { Input } from '@/components/ui/input'
import FilterSection from '@/widgets/filter/components/FilterSection.vue'

interface Props {
  label: string
  minValue: string
  maxValue: string
  minPlaceholder?: string
  maxPlaceholder?: string
}

withDefaults(defineProps<Props>(), {
  minPlaceholder: 'Von €',
  maxPlaceholder: 'Bis €'
})

const emit = defineEmits<{
  (event: 'update:minValue', value: string): void
  (event: 'update:maxValue', value: string): void
  (event: 'keydown', value: KeyboardEvent): void
  (event: 'paste', value: ClipboardEvent): void
  (event: 'clear'): void
}>()
</script>

<template>
  <FilterSection
    :label="label"
    :can-clear="Boolean(minValue || maxValue)"
    @clear="emit('clear')"
  >
    <div class="grid grid-cols-2 gap-2">
      <Input
        :model-value="minValue"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        :placeholder="minPlaceholder"
        @keydown="emit('keydown', $event)"
        @paste="emit('paste', $event)"
        @update:model-value="(value) => emit('update:minValue', String(value))"
      />
      <Input
        :model-value="maxValue"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        :placeholder="maxPlaceholder"
        @keydown="emit('keydown', $event)"
        @paste="emit('paste', $event)"
        @update:model-value="(value) => emit('update:maxValue', String(value))"
      />
    </div>
  </FilterSection>
</template>
