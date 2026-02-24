import AutoShopFilterWidget from './AutoShopFilterWidget.vue'
import { createWidgetAdapter } from '@/widgets/adapter/createWidgetAdapter'
import '@/styles/index.css'

const ATTRIBUTE_TO_PROP_MAP = {
  'results-child-selector': 'resultsChildSelector'
} as const

const adapter = createWidgetAdapter({
  component: AutoShopFilterWidget,
  defaultTagName: 'digital35-meinfahrzeugshop-suche',
  attributeToPropMap: ATTRIBUTE_TO_PROP_MAP,
  mountPointClassName: 'digital35-meinfahrzeugshop-suche-root'
})

export const AUTO_SHOP_FILTER_WIDGET_TAG = adapter.defaultTagName
export const mountAutoShopFilterWidget = adapter.mount
export const unmountAutoShopFilterWidget = adapter.unmount
export const registerAutoShopFilterWidgetElement = adapter.registerElement

registerAutoShopFilterWidgetElement()

export { AutoShopFilterWidget }
