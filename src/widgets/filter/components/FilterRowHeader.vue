<script setup lang="ts">
import { AccordionTrigger } from '@/components/ui/accordion'

interface Props {
  label: string
  activeCount?: number
}

withDefaults(defineProps<Props>(), {
  activeCount: 0
})
</script>

<template>
  <AccordionTrigger class="py-3 text-[15px] font-medium text-[#223247] hover:no-underline">
    <div class="flex min-w-0 items-center gap-2">
      <span class="truncate">{{ label }}</span>
      <span
        v-if="activeCount > 0"
        class="inline-flex min-w-5 items-center justify-center rounded-full bg-[#e7eef8] px-1.5 py-0.5 text-[11px] font-semibold text-[#2d5b97]"
      >
        {{ activeCount }}
      </span>
    </div>
  </AccordionTrigger>
</template>
