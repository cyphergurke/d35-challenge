<script setup lang="ts">
import { Megaphone, MoveRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { PromoTile } from '@/widgets/filter/results/types'

interface Props {
  promo: PromoTile
}

defineProps<Props>()
</script>

<template>
  <article
    class="flex h-full min-h-[280px] flex-col justify-between rounded-2xl border border-dashed border-[#9eb5d6] bg-[#edf4ff] p-5"
  >
    <div class="space-y-3">
      <span
        class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f67c9] text-white"
      >
        <Megaphone class="size-4" />
      </span>
      <h3 class="text-xl font-semibold leading-tight text-[#1f3354]">
        {{ promo.title }}
      </h3>
      <p class="text-sm leading-relaxed text-[#3f5d87]">
        {{ promo.description }}
      </p>
    </div>

    <Button
      variant="outline"
      class="mt-6 w-full justify-between rounded-xl border-[#8eabcf] bg-white text-[#1f3e70]"
    >
      {{ promo.ctaLabel }}
      <MoveRight class="size-4" />
    </Button>
  </article>
</template>
