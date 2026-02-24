<script setup lang="ts">
import AutoShopSearchWidget from './AutoShopSearchWidget.vue'

defineProps<{
  hostElement?: HTMLElement | null
  resultsChildSelector?: string
}>()
</script>

<template>
  <AutoShopSearchWidget
    :host-element="hostElement"
    :results-child-selector="resultsChildSelector"
  />
</template>
