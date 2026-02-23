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
  'script-urls': 'scriptUrls',
  'results-child-selector': 'resultsChildSelector'
} as const

const BOOLEAN_ATTRIBUTES = new Set<keyof typeof ATTRIBUTE_TO_PROP_MAP>(['is-car-carousel-autoplay'])
const OBSERVED_ATTRIBUTES = Object.keys(ATTRIBUTE_TO_PROP_MAP)

type AttributeName = keyof typeof ATTRIBUTE_TO_PROP_MAP
type PropName = (typeof ATTRIBUTE_TO_PROP_MAP)[AttributeName]
type WidgetProps = Partial<Record<PropName, string | boolean>>
type RootComponentProps = WidgetProps & { hostElement?: HTMLElement | null }

export const AUTO_SHOP_FILTER_WIDGET_TAG = 'auto-shop-filter-widget'

let mountedWidgetApp: VueApp<Element> | null = null

function isKnownAttribute(name: string): name is AttributeName {
  return name in ATTRIBUTE_TO_PROP_MAP
}

function toPropValue(attributeName: AttributeName, value: string): string | boolean {
  if (BOOLEAN_ATTRIBUTES.has(attributeName)) {
    return value !== 'false'
  }

  return value
}

function readHostAttributes(host: HTMLElement): WidgetProps {
  const props: WidgetProps = {}

  for (const attributeName of OBSERVED_ATTRIBUTES) {
    if (!host.hasAttribute(attributeName)) {
      continue
    }

    const typedAttribute = attributeName as AttributeName
    const propName = ATTRIBUTE_TO_PROP_MAP[typedAttribute]
    const attributeValue = host.getAttribute(attributeName) ?? ''

    props[propName] = toPropValue(typedAttribute, attributeValue)
  }

  return props
}

function createRootProps(host: HTMLElement): RootComponentProps {
  return {
    ...readHostAttributes(host),
    hostElement: host
  }
}

function createWidgetApp(hostForProps: HTMLElement): VueApp<Element> {
  return createApp(AutoShopFilterWidget, createRootProps(hostForProps))
}

export function mountAutoShopFilterWidget(options: WidgetMountOptions): void {
  const host = document.querySelector<HTMLElement>(options.target)

  if (!host) {
    throw new Error(`Mount target not found: ${options.target}`)
  }

  unmountAutoShopFilterWidget()

  mountedWidgetApp = createWidgetApp(host)
  mountedWidgetApp.mount(host)
}

export function unmountAutoShopFilterWidget(): void {
  if (!mountedWidgetApp) {
    return
  }

  mountedWidgetApp.unmount()
  mountedWidgetApp = null
}

class AutoShopFilterWidgetElement extends HTMLElement {
  private app: VueApp<Element> | null = null
  private mountPoint: HTMLDivElement | null = null

  static get observedAttributes(): string[] {
    return OBSERVED_ATTRIBUTES
  }

  connectedCallback(): void {
    if (this.app) {
      return
    }

    this.mountPoint = document.createElement('div')
    this.mountPoint.className = 'auto-shop-filter-widget-root'
    this.appendChild(this.mountPoint)

    this.app = createWidgetApp(this)
    this.app.mount(this.mountPoint)
  }

  disconnectedCallback(): void {
    this.unmountInstance()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !isKnownAttribute(name) || !this.isConnected || !this.app) {
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

    this.mountPoint?.remove()
    this.mountPoint = null
  }
}

export function registerAutoShopFilterWidgetElement(tagName = AUTO_SHOP_FILTER_WIDGET_TAG): void {
  if (customElements.get(tagName)) {
    return
  }

  customElements.define(tagName, AutoShopFilterWidgetElement)
}

registerAutoShopFilterWidgetElement()

export { AutoShopFilterWidget }
