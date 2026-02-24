<script setup lang="ts">
import type { AccordionTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import {
  AccordionHeader,
  AccordionTrigger,
  useForwardProps
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      v-bind="forwardedProps"
      :class="
        cn(
          'group flex flex-1 items-center justify-between gap-3 py-4 text-left text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          props.class
        )
      "
    >
      <slot />
      <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionTrigger>
  </AccordionHeader>
</template>
