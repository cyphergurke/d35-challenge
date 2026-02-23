import { createApp, type App as VueApp } from 'vue'
import type { WidgetMountOptions } from '@/types/widget'
import AutoShopFilterWidget from './AutoShopFilterWidget.vue'
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

const BOOLEAN_ATTRIBUTES = new Set(['is-car-carousel-autoplay'])

type AttributeName = keyof typeof ATTRIBUTE_TO_PROP_MAP
type PropName = (typeof ATTRIBUTE_TO_PROP_MAP)[AttributeName]
type WidgetProps = Partial<Record<PropName, string | boolean>>
type RootComponentProps = WidgetProps & { hostElement?: HTMLElement | null }

export const AUTO_SHOP_FILTER_WIDGET_TAG = 'auto-shop-filter-widget'

let widgetApp: VueApp<Element> | null = null

function readPropsFromHostAttributes(host: HTMLElement): WidgetProps {
  const props: WidgetProps = {}

  for (const [attributeName, propName] of Object.entries(ATTRIBUTE_TO_PROP_MAP) as Array<
    [AttributeName, PropName]
  >) {
    if (!host.hasAttribute(attributeName)) {
      continue
    }

    const attributeValue = host.getAttribute(attributeName) ?? ''
    props[propName] = BOOLEAN_ATTRIBUTES.has(attributeName)
      ? attributeValue !== 'false'
      : attributeValue
  }

  return props
}

export function mountAutoShopFilterWidget(options: WidgetMountOptions): void {
  const host = document.querySelector<HTMLElement>(options.target)

  if (!host) {
    throw new Error(`Mount target not found: ${options.target}`)
  }

  unmountAutoShopFilterWidget()
  const props: RootComponentProps = { ...readPropsFromHostAttributes(host), hostElement: host }
  widgetApp = createApp(AutoShopFilterWidget, props)
  widgetApp.mount(host)
}

export function unmountAutoShopFilterWidget(): void {
  if (!widgetApp) {
    return
  }

  widgetApp.unmount()
  widgetApp = null
}

class AutoShopFilterWidgetElement extends HTMLElement {
  private app: VueApp<Element> | null = null

  private mountPoint: HTMLDivElement | null = null

  static get observedAttributes(): string[] {
    return Object.keys(ATTRIBUTE_TO_PROP_MAP)
  }

  connectedCallback(): void {
    if (this.app) {
      return
    }

    this.mountPoint = document.createElement('div')
    this.mountPoint.className = 'auto-shop-filter-widget-root'
    this.appendChild(this.mountPoint)

    const props: RootComponentProps = { ...readPropsFromHostAttributes(this), hostElement: this }
    this.app = createApp(AutoShopFilterWidget, props)
    this.app.mount(this.mountPoint)
  }

  disconnectedCallback(): void {
    this.unmountInstance()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !ATTRIBUTE_TO_PROP_MAP[name as AttributeName]) {
      return
    }

    if (!this.isConnected || !this.app) {
      return
    }

    this.unmountInstance()
    this.connectedCallback()
  }

  private unmountInstance(): void {
    if (!this.app) {
      return
    }

    this.app.unmount()
    this.app = null

    if (this.mountPoint) {
      this.mountPoint.remove()
      this.mountPoint = null
    }
  }
}

export function registerAutoShopFilterWidgetElement(
  tagName = AUTO_SHOP_FILTER_WIDGET_TAG
): void {
  if (customElements.get(tagName)) {
    return
  }

  customElements.define(tagName, AutoShopFilterWidgetElement)
}

registerAutoShopFilterWidgetElement()

export { AutoShopFilterWidget }
