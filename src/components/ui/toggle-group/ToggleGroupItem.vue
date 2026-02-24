<script setup lang="ts">
import type { PrimitiveProps, ToggleGroupItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ToggleVariants } from '.'
import { reactiveOmit } from '@vueuse/core'
import { ToggleGroupItem, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { toggleVariants } from '.'

interface Props extends ToggleGroupItemProps, PrimitiveProps {
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const delegatedProps = reactiveOmit(props, 'variant', 'size', 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <ToggleGroupItem
    v-bind="forwardedProps"
    :class="cn(toggleVariants({ variant, size }), props.class)"
  >
    <slot />
  </ToggleGroupItem>
</template>
