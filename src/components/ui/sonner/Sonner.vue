<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster, type ToasterProps } from 'vue-sonner'

const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'top-center',
  richColors: true,
  closeButton: true,
  duration: 2800
})
</script>

<template>
  <Toaster v-bind="props" />
</template>
