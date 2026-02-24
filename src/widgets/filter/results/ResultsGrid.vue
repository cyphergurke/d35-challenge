<script setup lang="ts">
import { computed } from 'vue'
import CarCard from '@/widgets/filter/results/CarCard.vue'
import PromoCard from '@/widgets/filter/results/PromoCard.vue'
import type { CarListing, CarOfferCardModel, PromoTile } from '@/widgets/filter/results/types'

interface Props {
  listings: CarListing[]
  isFavorite: (listingId: string) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'toggle-favorite', listingId: string): void
}>()

interface CarGridEntry {
  type: 'car'
  id: string
  model: CarOfferCardModel
}

interface PromoGridEntry {
  type: 'promo'
  id: string
  promo: PromoTile
}

type GridEntry = CarGridEntry | PromoGridEntry

const promoTemplates: readonly PromoTile[] = [
  {
    id: 'promo-sell-car',
    title: 'Wir kaufen dein Auto in 24h',
    description:
      'Fahrzeug online bewerten, Sofortangebot erhalten und auf Wunsch direkt abholen lassen.',
    ctaLabel: 'Jetzt Angebot sichern'
  },
  {
    id: 'promo-financing',
    title: 'Flexible Finanzierung',
    description: 'Vergleiche Leasing, Kredit und Abo direkt neben den Suchergebnissen.',
    ctaLabel: 'Finanzierung ansehen'
  }
]

function pickPromo(index: number): PromoTile {
  const promo = promoTemplates[index % promoTemplates.length]
  if (!promo) {
    throw new Error('Missing promo tile template')
  }

  return promo
}

const decimalFormatter = new Intl.NumberFormat('de-DE')

function toCardModel(listing: CarListing): CarOfferCardModel {
  const consumptionLine = [listing.consumptionText, listing.emissionsText]
    .filter((item): item is string => Boolean(item))
    .join(' | ')

  return {
    id: listing.id,
    title: listing.title,
    subtitle: listing.subtitle,
    imageUrl: listing.imageUrl,
    monthlyRate: listing.monthlyRate
      ? {
          amount: Math.round(listing.monthlyRate),
          unitLabel: 'im Monat'
        }
      : undefined,
    has360: listing.has360,
    specsTop: [
      `${listing.powerPs} PS`,
      `${decimalFormatter.format(listing.kilometers)} km`,
      `EZ ${listing.year}`
    ],
    specsBottom: [listing.fuel, listing.transmission, listing.bodyType],
    consumptionLine: consumptionLine || undefined,
    price: {
      amount: Math.round(listing.price),
      currency: 'EUR'
    },
    detailsHref: listing.detailUrl,
    isFavorite: props.isFavorite(listing.id)
  }
}

const gridEntries = computed<GridEntry[]>(() => {
  const entries: GridEntry[] = []

  for (const [index, listing] of props.listings.entries()) {
    entries.push({
      type: 'car',
      id: listing.id,
      model: toCardModel(listing)
    })

    const shouldInsertPromo = (index + 1) % 7 === 0
    if (!shouldInsertPromo) {
      continue
    }

    const promo = pickPromo(index)
    entries.push({
      type: 'promo',
      id: `${promo.id}-${index}`,
      promo
    })
  }

  return entries
})

function handleToggleFavorite(listingId: string): void {
  emit('toggle-favorite', listingId)
}

function handleOpenDetails(listingId: string): void {
  const listing = props.listings.find((item) => item.id === listingId)
  if (!listing || !listing.detailUrl || listing.detailUrl === '#') {
    return
  }

  window.location.assign(listing.detailUrl)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    <template v-for="entry in gridEntries" :key="entry.id">
      <CarCard
        v-if="entry.type === 'car'"
        :model="entry.model"
        @toggle-favorite="handleToggleFavorite"
        @open-details="handleOpenDetails"
      />
      <PromoCard
        v-else
        :promo="entry.promo"
      />
    </template>
  </div>
</template>
