<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
  label: string
  canClear?: boolean
  clearLabel?: string
  titleClass?: string
}

withDefaults(defineProps<Props>(), {
  canClear: false,
  clearLabel: 'Clear',
  titleClass: 'text-[20px] font-semibold text-[#2a3342]'
})

defineEmits<{
  (event: 'clear'): void
}>()
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between">
      <h3 :class="titleClass">{{ label }}</h3>
      <Button
        v-if="canClear"
        variant="ghost"
        size="sm"
        class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
        @click="$emit('clear')"
      >
        {{ clearLabel }}
      </Button>
    </div>
    <slot />
  </div>
</template>
