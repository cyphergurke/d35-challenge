import type { ShopWrapperAttributeProps } from '@/widgets/filter/types/wrapper'

export const DEFAULT_SHOP_WRAPPER_CONFIG = {
  clientBaseUrl: 'https://minrath.de/fahrzeugshop#',
  apiBaseUrl: 'https://production.meinfahrzeug.shop/api',
  cdnUrl:
    'https://s3-eu-central-1.ionoscloud.com/static-webshop/881d1f9e-ce12-43ce-9a64-e9fe1caf1ff7/widgets/production/',
  queryParams: '',
  widgetType: '1',
  tenantAdminId: '881d1f9e-ce12-43ce-9a64-e9fe1caf1ff7',
  isCarCarouselAutoplay: false,
  paddingX: '32px',
  paddingTop: '0px',
  paddingBottom: '32px',
  pagesSearchFilterEnforcedManufacturer: '',
  searchFilterEnforcedVehicleTypes: '',
  enforcedVehicleRequestParameters: ''
} as const satisfies Required<ShopWrapperAttributeProps>

type WrapperAttributeDefinition = {
  attribute: string
  value: string | boolean | undefined
}

function setAttributeIfDefined(
  element: HTMLElement,
  name: string,
  value: string | boolean | undefined
): void {
  if (value === undefined) {
    return
  }

  element.setAttribute(name, String(value))
}

export function applyShopWrapperAttributes(
  element: HTMLElement,
  queryParams: string,
  props: ShopWrapperAttributeProps
): void {
  const attributes: WrapperAttributeDefinition[] = [
    {
      attribute: 'client-base-url',
      value: props.clientBaseUrl ?? DEFAULT_SHOP_WRAPPER_CONFIG.clientBaseUrl
    },
    {
      attribute: 'api-base-url',
      value: props.apiBaseUrl ?? DEFAULT_SHOP_WRAPPER_CONFIG.apiBaseUrl
    },
    {
      attribute: 'cdn-url',
      value: props.cdnUrl ?? DEFAULT_SHOP_WRAPPER_CONFIG.cdnUrl
    },
    {
      attribute: 'query-params',
      value: queryParams
    },
    {
      attribute: 'widget-type',
      value: props.widgetType ?? DEFAULT_SHOP_WRAPPER_CONFIG.widgetType
    },
    {
      attribute: 'tenant-admin-id',
      value: props.tenantAdminId ?? DEFAULT_SHOP_WRAPPER_CONFIG.tenantAdminId
    },
    {
      attribute: 'is-car-carousel-autoplay',
      value:
        props.isCarCarouselAutoplay ??
        DEFAULT_SHOP_WRAPPER_CONFIG.isCarCarouselAutoplay
    },
    {
      attribute: 'padding-x',
      value: props.paddingX ?? DEFAULT_SHOP_WRAPPER_CONFIG.paddingX
    },
    {
      attribute: 'padding-top',
      value: props.paddingTop ?? DEFAULT_SHOP_WRAPPER_CONFIG.paddingTop
    },
    {
      attribute: 'padding-bottom',
      value: props.paddingBottom ?? DEFAULT_SHOP_WRAPPER_CONFIG.paddingBottom
    },
    {
      attribute: 'pages-search-filter-enforced-manufacturer',
      value:
        props.pagesSearchFilterEnforcedManufacturer ??
        DEFAULT_SHOP_WRAPPER_CONFIG.pagesSearchFilterEnforcedManufacturer
    },
    {
      attribute: 'search-filter-enforced-vehicle-types',
      value:
        props.searchFilterEnforcedVehicleTypes ??
        DEFAULT_SHOP_WRAPPER_CONFIG.searchFilterEnforcedVehicleTypes
    },
    {
      attribute: 'enforced-vehicle-request-parameters',
      value:
        props.enforcedVehicleRequestParameters ??
        DEFAULT_SHOP_WRAPPER_CONFIG.enforcedVehicleRequestParameters
    }
  ]

  for (const { attribute, value } of attributes) {
    setAttributeIfDefined(element, attribute, value)
  }
}
