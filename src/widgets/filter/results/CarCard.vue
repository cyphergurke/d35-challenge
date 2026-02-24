<script setup lang="ts">
import { computed } from 'vue'
import { Heart, RotateCw } from 'lucide-vue-next'

export type Currency = 'EUR'

export interface MonthlyRate {
  amount: number
  unitLabel: string
}

export interface PriceInfo {
  amount: number
  currency: Currency
  grossNote?: string
}

export interface CarOfferCardModel {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  monthlyRate?: MonthlyRate
  has360?: boolean
  specsTop: readonly string[]
  specsBottom: readonly string[]
  consumptionLine?: string
  price: PriceInfo
  detailsHref?: string
  isFavorite?: boolean
}

const props = defineProps<{
  model: CarOfferCardModel
}>()

const emit = defineEmits<{
  (event: 'toggle-favorite', id: string): void
  (event: 'open-details', id: string): void
}>()

const priceText = computed(() => {
  const currencySymbol = props.model.price.currency === 'EUR' ? '€' : ''
  const formatted = new Intl.NumberFormat('de-DE').format(props.model.price.amount)
  return `${formatted} ${currencySymbol}`.trim()
})

const monthlyRateText = computed(() => {
  if (!props.model.monthlyRate) return null
  const formatted = new Intl.NumberFormat('de-DE').format(props.model.monthlyRate.amount)
  return {
    amount: `ab ${formatted}€`,
    unit: props.model.monthlyRate.unitLabel
  }
})

function onToggleFavorite(): void {
  emit('toggle-favorite', props.model.id)
}

function onOpenDetails(event: MouseEvent): void {
  event.preventDefault()
  emit('open-details', props.model.id)
}
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-tl-[24px] rounded-tr-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition will-change-transform hover:-translate-y-[2px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)]"
  >
    <div class="relative bg-[#e4e6ea]">
      <div
        v-if="monthlyRateText"
        class="absolute left-4 top-4 z-10 -rotate-[10deg] rounded-[14px] bg-[#141414] px-3 py-2 text-white shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
      >
        <div class="text-[14px] font-semibold leading-[1.1]">
          {{ monthlyRateText.amount }}
        </div>
        <div class="text-[11px] leading-[1.1]">
          {{ monthlyRateText.unit }}
        </div>
      </div>

      <button
        type="button"
        class="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[rgba(0,0,0,0.75)] backdrop-blur transition hover:bg-white"
        :aria-label="props.model.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        @click="onToggleFavorite"
      >
        <Heart
          class="h-5 w-5"
          :class="props.model.isFavorite ? 'fill-[rgba(0,0,0,0.75)]' : 'fill-transparent'"
        />
      </button>

      <div class="h-[248px] w-full overflow-hidden">
        <img
          :src="props.model.imageUrl"
          :alt="props.model.title"
          class="h-full w-full select-none object-cover"
          loading="lazy"
          draggable="false"
        />
      </div>

      <div
        v-if="props.model.has360"
        class="absolute bottom-4 right-4 flex items-center gap-1 text-[11px] text-[rgba(0,0,0,0.75)]"
      >
        <span>360°</span>
        <RotateCw class="h-4 w-4" />
      </div>
    </div>

    <section
      class="rounded-bl-[24px] rounded-br-[0px] rounded-tl-[0px] rounded-tr-[0px] bg-[#1f2328] p-[12px] text-white"
    >
      <header>
        <h3 class="text-[20px] font-semibold leading-[1.15]">
          {{ props.model.title }}
        </h3>
        <p class="mt-1 text-[12px] leading-[1.2] text-[rgba(255,255,255,0.65)]">
          {{ props.model.subtitle }}
        </p>
      </header>

      <div class="mt-3 space-y-2">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="spec in props.model.specsTop"
            :key="`spec-top-${props.model.id}-${spec}`"
            class="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.22)] px-[10px] py-1 text-[11px] font-medium text-[rgba(255,255,255,0.92)]"
          >
            {{ spec }}
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="spec in props.model.specsBottom"
            :key="`spec-bottom-${props.model.id}-${spec}`"
            class="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.22)] px-[10px] py-1 text-[11px] font-medium text-[rgba(255,255,255,0.92)]"
          >
            {{ spec }}
          </span>
        </div>

        <div class="flex">
          <span
            class="inline-flex min-h-[26px] w-full items-center rounded-full border px-[10px] py-1 text-[11px] font-medium"
            :class="
              props.model.consumptionLine
                ? 'border-[rgba(255,255,255,0.22)] text-[rgba(255,255,255,0.92)]'
                : 'border-transparent text-transparent'
            "
            :aria-hidden="!props.model.consumptionLine"
          >
            {{ props.model.consumptionLine ?? '\u00A0' }}
          </span>
        </div>
      </div>

      <div class="mt-4 flex items-end justify-between gap-3">
        <div>
          <div class="text-[24px] font-bold leading-none">
            {{ priceText }}
          </div>
          <div
            v-if="props.model.price.grossNote"
            class="mt-1 text-[11px] text-[rgba(255,255,255,0.65)]"
          >
            {{ props.model.price.grossNote }}
          </div>
        </div>

        <a
          :href="props.model.detailsHref ?? '#'"
          class="inline-flex items-center gap-1 pb-[2px] text-[14px] font-semibold text-[#2d72e8] transition hover:text-[#1f66e0]"
          @click="onOpenDetails"
        >
          <span>Details</span>
          <span aria-hidden="true">&gt;</span>
        </a>
      </div>
    </section>
  </article>
</template>
