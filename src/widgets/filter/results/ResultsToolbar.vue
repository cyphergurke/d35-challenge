<script setup lang="ts">
import { computed } from 'vue'
import { Heart, Mail, Save, SlidersHorizontal, Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { SortKey, SortOption } from '@/widgets/filter/results/types'

interface Props {
  sortKey: SortKey
  sortOptions: readonly SortOption[]
  favoritesCount: number
  totalCount: number
  pageSize: number
  pageSizeOptions: readonly number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'update:sortKey', value: SortKey): void
  (event: 'update:pageSize', value: number): void
  (event: 'open-search-alert'): void
  (event: 'save-search'): void
}>()

const selectedSort = computed<SortKey>({
  get: () => props.sortKey,
  set: (value) => emit('update:sortKey', value)
})

const selectedPageSize = computed<string>({
  get: () => String(props.pageSize),
  set: (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed % 3 !== 0) {
      return
    }

    emit('update:pageSize', parsed)
  }
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1 text-xs text-[#6c7f99]">
        <SlidersHorizontal class="size-4" />
        <span>{{ totalCount }} Treffer</span>
      </div>
      <Select v-model="selectedSort">
        <SelectTrigger class="h-9 min-w-[210px] bg-[#f6f8fc] text-[#1f2a3a]">
          <SelectValue placeholder="Sortieren" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in sortOptions"
            :key="option.key"
            :value="option.key"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="selectedPageSize">
        <SelectTrigger class="h-9 min-w-[160px] bg-[#f6f8fc] text-[#1f2a3a]">
          <SelectValue placeholder="Pro Seite" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in pageSizeOptions"
            :key="`page-size-${option}`"
            :value="String(option)"
          >
            {{ option }} pro Seite
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1 rounded-xl border border-[#d4deea] bg-white px-3 text-sm text-[#21324a] transition hover:bg-[#eef3fa]"
      >
        <Heart
          class="size-4"
          :class="favoritesCount > 0 ? 'fill-[#ef4f6b] text-[#ef4f6b]' : 'text-[#6b7d95]'"
        />
        <span>{{ favoritesCount }}</span>
      </button>

      <Button
        variant="outline"
        class="h-9 rounded-xl border-[#d4deea] bg-[#f6f8fc] text-[#21324a]"
        @click="emit('open-search-alert')"
      >
        <Star class="size-4" />
        Suchauftrag
      </Button>

      <Button
        variant="ghost"
        class="h-9 rounded-xl px-3 text-[#2f64c6] hover:bg-[#edf3ff]"
        @click="emit('save-search')"
      >
        <Save class="size-4" />
        Suche speichern
      </Button>

      <Button
        variant="ghost"
        class="h-9 rounded-xl px-3 text-[#2f64c6] hover:bg-[#edf3ff]"
      >
        <Mail class="size-4" />
        Kontakt
      </Button>
    </div>
  </div>
</template>
