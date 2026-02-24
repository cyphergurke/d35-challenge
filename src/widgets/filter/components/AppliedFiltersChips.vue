<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AppliedFilter } from '@/widgets/filter/types/filters'

interface Props {
  appliedFilters: AppliedFilter[]
  onRemove: (filter: AppliedFilter) => void
  onClearAll: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-[22px] leading-none text-[#2a3342]">Applied filters</h3>
      <Button
        v-if="appliedFilters.length > 0"
        variant="ghost"
        size="sm"
        class="h-8 rounded-xl px-3 text-sm text-[#232b39] hover:bg-[#e6ecf4]"
        @click="onClearAll()"
      >
        Clear all
      </Button>
    </div>

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
          @click="onRemove(appliedFilter)"
        >
          <X class="size-3 text-[#6f8099]" />
        </button>
      </Badge>
    </div>
    <p v-else class="text-xs text-[#90a0b7]">No filters selected.</p>
  </div>
</template>
