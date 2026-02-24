<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AppliedFilter } from '@/widgets/filter/types/filters'

interface Props {
  appliedFilters: AppliedFilter[]
  onClearAll: () => void
  onRemoveFilter: (filter: AppliedFilter) => void
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-2 border-t border-[#d9e2ef] pt-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="text-sm font-semibold text-[#2a3342]">Aktive Filter</div>
      <Button
        v-if="appliedFilters.length > 0"
        variant="ghost"
        size="sm"
        class="h-8 rounded-lg text-xs text-[#31435d] hover:bg-[#edf2f8]"
        @click="onClearAll()"
      >
        Alle löschen
      </Button>
    </div>

    <div v-if="appliedFilters.length > 0" class="flex flex-wrap gap-2">
      <Badge
        v-for="filter in appliedFilters"
        :key="filter.id"
        variant="secondary"
        class="rounded-full border border-[#ccdae8] bg-[#edf3fb] px-2.5 py-1 text-[11px] text-[#25354b]"
      >
        {{ filter.label }}
        <button
          type="button"
          class="inline-flex rounded-full p-0.5 hover:bg-[#d9e6f5]"
          @click="onRemoveFilter(filter)"
        >
          <X class="size-3 text-[#607794]" />
        </button>
      </Badge>
    </div>

    <p v-else class="text-xs text-[#8aa0bd]">Keine Filter aktiv.</p>
  </div>
</template>
