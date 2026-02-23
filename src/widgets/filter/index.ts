import AutoShopFilterWidget from './AutoShopFilterWidget.vue'
import { createWidgetAdapter } from '@/widgets/adapter/createWidgetAdapter'
import '@/styles/index.css'

const ATTRIBUTE_TO_PROP_MAP = {
  'client-base-url': 'clientBaseUrl',
  'api-base-url': 'apiBaseUrl',
  'cdn-url': 'cdnUrl',
  'query-params': 'queryParams',
  'widget-type': 'widgetType',
  'tenant-admin-id': 'tenantAdminId',
  'is-car-carousel-autoplay': 'isCarCarouselAutoplay',
  'padding-x': 'paddingX',
  'padding-top': 'paddingTop',
  'padding-bottom': 'paddingBottom',
  'pages-search-filter-enforced-manufacturer': 'pagesSearchFilterEnforcedManufacturer',
  'search-filter-enforced-vehicle-types': 'searchFilterEnforcedVehicleTypes',
  'enforced-vehicle-request-parameters': 'enforcedVehicleRequestParameters',
  'script-urls': 'scriptUrls'
} as const

const BOOLEAN_ATTRIBUTES = ['is-car-carousel-autoplay'] as const

const adapter = createWidgetAdapter({
  component: AutoShopFilterWidget,
  defaultTagName: 'digital35-meinfahrzeugshop-suche',
  attributeToPropMap: ATTRIBUTE_TO_PROP_MAP,
  booleanAttributes: BOOLEAN_ATTRIBUTES,
  mountPointClassName: 'digital35-meinfahrzeugshop-suche-root'
})

export const DIGITAL35_MEINFAHRZEUGSHOP_SUCHE_TAG = adapter.defaultTagName
export const AUTO_SHOP_FILTER_WIDGET_TAG = adapter.defaultTagName
export const mountAutoShopFilterWidget = adapter.mount
export const unmountAutoShopFilterWidget = adapter.unmount
export const registerAutoShopFilterWidgetElement = adapter.registerElement

registerAutoShopFilterWidgetElement()

export { AutoShopFilterWidget }
