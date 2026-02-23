<script setup lang="ts">
import { computed } from 'vue'
import { Check, Search, X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle
} from 'reka-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { FilterOption } from '@/widgets/filter/types/filters'
import SelectFilter from './SelectFilter.vue'
import FilterSection from './FilterSection.vue'

interface Props {
  open: boolean
  doorsValue: string | undefined
  seatsValue: string | undefined
  extrasValue: string[]
  searchValue: string
  doorOptions: FilterOption[]
  seatOptions: FilterOption[]
  extraOptions: FilterOption[]
  filteredExtraOptions: FilterOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'update:doorsValue', value: string | undefined): void
  (event: 'update:seatsValue', value: string | undefined): void
  (event: 'update:extrasValue', value: string[]): void
  (event: 'update:searchValue', value: string): void
}>()

const openProxy = computed<boolean>({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

function toggleExtra(value: string): void {
  if (props.extrasValue.includes(value)) {
    emit(
      'update:extrasValue',
      props.extrasValue.filter((item) => item !== value)
    )
    return
  }

  emit('update:extrasValue', [...props.extrasValue, value])
}

function removeExtra(value: string): void {
  emit(
    'update:extrasValue',
    props.extrasValue.filter((item) => item !== value)
  )
}
</script>

<template>
  <DialogRoot v-model:open="openProxy">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/45" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[min(760px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#c8d2de] bg-[#f7f9fc] p-4 shadow-xl focus:outline-none"
      >
        <div class="flex items-center justify-between">
          <DialogTitle class="text-[24px] leading-none text-[#2a3342]">Auto extras</DialogTitle>
          <DialogClose as-child>
            <Button
              variant="ghost"
              size="icon-sm"
              class="rounded-full"
            >
              <X class="size-4 text-[#2a3342]" />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription class="sr-only">
          Weitere Fahrzeugdetails wie Tueren, Sitze und Zusatzausstattung.
        </DialogDescription>

        <div class="mt-4 space-y-4">
          <SelectFilter
            label="Anzahl Tueren"
            title-class="text-[18px] font-semibold text-[#2a3342]"
            placeholder="Anzahl Tueren waehlen"
            :options="doorOptions"
            :model-value="doorsValue"
            @update:model-value="(value) => emit('update:doorsValue', value)"
          />

          <Separator class="bg-[#d6dfeb]" />

          <SelectFilter
            label="Anzahl Sitze"
            title-class="text-[18px] font-semibold text-[#2a3342]"
            placeholder="Anzahl Sitze waehlen"
            :options="seatOptions"
            :model-value="seatsValue"
            @update:model-value="(value) => emit('update:seatsValue', value)"
          />

          <Separator class="bg-[#d6dfeb]" />

          <FilterSection
            label="Extras"
            title-class="text-[18px] font-semibold text-[#2a3342]"
            :can-clear="extrasValue.length > 0"
            @clear="emit('update:extrasValue', [])"
          >
            <div class="space-y-2">
              <div class="relative w-full items-center">
                <Input
                  :model-value="searchValue"
                  class="w-full pl-9 pr-3"
                  placeholder="Extras suchen"
                  @update:model-value="(value) => emit('update:searchValue', String(value))"
                />
                <span class="pointer-events-none absolute start-0 inset-y-0 flex items-center justify-center px-3">
                  <Search class="size-4 text-muted-foreground" />
                </span>
              </div>

              <div
                v-if="extrasValue.length > 0"
                class="flex flex-wrap gap-2"
              >
                <Badge
                  v-for="value in extrasValue"
                  :key="`selected-extra-${value}`"
                  variant="secondary"
                  class="rounded-full border border-[#c3cddd] bg-[#eaf0f7] px-2.5 py-0.5 text-xs font-medium text-[#243145]"
                >
                  {{ extraOptions.find((option) => option.value === value)?.label ?? value }}
                  <button
                    type="button"
                    class="inline-flex items-center rounded-full p-0.5 transition hover:bg-[#d8e2ef]"
                    @click="removeExtra(value)"
                  >
                    <X class="size-3 text-[#6f8099]" />
                  </button>
                </Badge>
              </div>

              <div class="max-h-[46vh] overflow-y-auto rounded-lg border border-[#d3dbe7] bg-white p-1">
                <button
                  v-for="option in filteredExtraOptions"
                  :key="option.id"
                  type="button"
                  class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-[#f1f5fb]"
                  @click="toggleExtra(option.value)"
                >
                  <span class="text-sm text-[#2a3342]">{{ option.label }}</span>
                  <Check
                    class="size-4"
                    :class="extrasValue.includes(option.value) ? 'opacity-100 text-[#2a3342]' : 'opacity-0'"
                  />
                </button>
                <p
                  v-if="filteredExtraOptions.length === 0"
                  class="px-2 py-2 text-xs text-[#90a0b7]"
                >
                  Keine passenden Extras.
                </p>
              </div>
            </div>
          </FilterSection>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
