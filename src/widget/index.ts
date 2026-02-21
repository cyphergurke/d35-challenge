import { createApp, type App as VueApp } from 'vue'
import type { WidgetMountOptions } from '@/types/widget'
import AutoShopFilterWidget from './AutoShopFilterWidget.vue'
import '@/styles/index.css'

let widgetApp: VueApp<Element> | null = null

export function mountAutoShopFilterWidget(options: WidgetMountOptions): void {
  const host = document.querySelector<HTMLElement>(options.target)

  if (!host) {
    throw new Error(`Mount target not found: ${options.target}`)
  }

  unmountAutoShopFilterWidget()
  widgetApp = createApp(AutoShopFilterWidget)
  widgetApp.mount(host)
}

export function unmountAutoShopFilterWidget(): void {
  if (!widgetApp) {
    return
  }

  widgetApp.unmount()
  widgetApp = null
}

export { AutoShopFilterWidget }
