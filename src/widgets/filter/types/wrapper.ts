export interface ShopWrapperAttributeProps {
  clientBaseUrl?: string
  apiBaseUrl?: string
  cdnUrl?: string
  queryParams?: string
  widgetType?: string
  tenantAdminId?: string
  isCarCarouselAutoplay?: boolean | string
  paddingX?: string
  paddingTop?: string
  paddingBottom?: string
  pagesSearchFilterEnforcedManufacturer?: string
  searchFilterEnforcedVehicleTypes?: string
  enforcedVehicleRequestParameters?: string
}

export interface AutoShopFilterWidgetProps extends ShopWrapperAttributeProps {
  hostElement?: HTMLElement | null
  scriptUrls?: string
}
