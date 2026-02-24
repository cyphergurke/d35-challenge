import { createApp, type App as VueApp, type Component } from 'vue'
import type { WidgetMountOptions } from '@/types/widget'

type AttributeToPropMap = Readonly<Record<string, string>>

interface CreateWidgetAdapterConfig<Map extends AttributeToPropMap> {
  component: Component
  defaultTagName: string
  attributeToPropMap?: Map
  booleanAttributes?: ReadonlyArray<keyof Map & string>
  mountPointClassName?: string
}

export interface WidgetAdapter {
  readonly defaultTagName: string
  mount: (options: WidgetMountOptions) => void
  unmount: () => void
  registerElement: (tagName?: string) => void
}

export function createWidgetAdapter<
  Map extends AttributeToPropMap = Record<never, never>
>(config: CreateWidgetAdapterConfig<Map>): WidgetAdapter {
  const attributeToPropMap = (config.attributeToPropMap ?? {}) as Map
  const observedAttributes = Object.keys(attributeToPropMap) as Array<
    keyof Map & string
  >
  const knownAttributes = new Set<string>(observedAttributes)
  const booleanAttributes = new Set<string>(
    (config.booleanAttributes ?? []) as string[]
  )
  const mountPointClassName = config.mountPointClassName ?? 'widget-root'

  type PropName = Map[keyof Map]
  type WidgetProps = Partial<Record<PropName, string | boolean>>
  type RootComponentProps = WidgetProps & { hostElement?: HTMLElement | null }

  let mountedWidgetApp: VueApp<Element> | null = null

  function isKnownAttribute(name: string): name is keyof Map & string {
    return knownAttributes.has(name)
  }

  function toPropValue(
    attributeName: keyof Map & string,
    value: string
  ): string | boolean {
    if (booleanAttributes.has(attributeName)) {
      return value !== 'false'
    }

    return value
  }

  function readHostAttributes(host: HTMLElement): WidgetProps {
    const props: WidgetProps = {}

    for (const attributeName of observedAttributes) {
      if (!host.hasAttribute(attributeName)) {
        continue
      }

      const propName = attributeToPropMap[attributeName]
      const attributeValue = host.getAttribute(attributeName) ?? ''
      props[propName] = toPropValue(attributeName, attributeValue)
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
    return createApp(config.component, createRootProps(hostForProps))
  }

  function mount(options: WidgetMountOptions): void {
    const host = document.querySelector<HTMLElement>(options.target)

    if (!host) {
      throw new Error(`Mount target not found: ${options.target}`)
    }

    unmount()

    mountedWidgetApp = createWidgetApp(host)
    mountedWidgetApp.mount(host)
  }

  function unmount(): void {
    if (!mountedWidgetApp) {
      return
    }

    mountedWidgetApp.unmount()
    mountedWidgetApp = null
  }

  class GenericWidgetElement extends HTMLElement {
    private app: VueApp<Element> | null = null
    private mountPoint: HTMLDivElement | null = null

    static get observedAttributes(): string[] {
      return observedAttributes
    }

    connectedCallback(): void {
      if (this.app) {
        return
      }

      this.mountPoint = document.createElement('div')
      this.mountPoint.className = mountPointClassName
      this.appendChild(this.mountPoint)

      this.app = createWidgetApp(this)
      this.app.mount(this.mountPoint)
    }

    disconnectedCallback(): void {
      this.unmountInstance()
    }

    attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ): void {
      if (
        oldValue === newValue ||
        !isKnownAttribute(name) ||
        !this.isConnected ||
        !this.app
      ) {
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

  function registerElement(tagName = config.defaultTagName): void {
    if (customElements.get(tagName)) {
      return
    }

    customElements.define(tagName, GenericWidgetElement)
  }

  return {
    defaultTagName: config.defaultTagName,
    mount,
    unmount,
    registerElement
  }
}
