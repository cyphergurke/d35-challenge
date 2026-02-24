export type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'newest' | 'mileageAsc'

export interface SortOption {
  key: SortKey
  label: string
}

export interface PaginationModel {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type DoorGroup = '2/3' | '4/5' | '6+'

export interface CarListing {
  id: string
  title: string
  subtitle: string
  detailUrl: string
  imageUrl: string
  category: string
  make: string
  model: string
  bodyType: string
  fuel: string
  transmission: string
  condition: string
  year: number
  kilometers: number
  powerPs: number
  displacementCcm: number
  price: number
  monthlyRate?: number
  has360: boolean
  doors: DoorGroup
  seats: number
  extras: string[]
  financingOptions: string[]
  location?: string
  consumptionText?: string
  emissionsText?: string
  relevanceScore: number
  createdAt: string
}

export interface PromoTile {
  id: string
  title: string
  description: string
  ctaLabel: string
}

export type Currency = 'EUR'

export interface MonthlyRate {
  amount: number
  unitLabel: string
}

export interface PriceInfo {
  amount: number
  currency: Currency
  grossNote?: string
}

export interface CarOfferCardModel {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  monthlyRate?: MonthlyRate
  has360?: boolean
  specsTop: readonly string[]
  specsBottom: readonly string[]
  consumptionLine?: string
  price: PriceInfo
  detailsHref?: string
  isFavorite?: boolean
}

export interface WebshopPaginationHeader {
  CurrentPage: number
  TotalPages: number
  PageSize: number
  TotalCount: number
  HasPrevious: boolean
  HasNext: boolean
}

export interface WebshopCarQueryPaginator {
  pageNumber?: number
  totalPages?: number
  pageSize?: number
  totalCount?: number
  hasPrevious?: boolean
  hasNext?: boolean
}

export type WebshopCarOrderBy =
  | ''
  | 'PRICE'
  | 'PRICE DESC'
  | 'MILEAGE'
  | 'MILEAGE DESC'
  | 'INITIALREGISTRATION'
  | 'INITIALREGISTRATION DESC'
  | 'INITIALFINANCINGINSTALLMENT'
  | 'INITIALFINANCINGINSTALLMENT DESC'
  | 'INITIALLEASINGINSTALLMENT'
  | 'INITIALLEASINGINSTALLMENT DESC'

// Mirrors the CarQueryParameters model used by the webshop app bundle.
export interface WebshopCarQueryParameters {
  manufacturer?: string
  model?: string
  carType?: number
  maxPrice?: number
  minPrice?: number
  minEnginePower?: number
  maxEnginePower?: number
  maxMileAge?: number
  minInitialRegistration?: string
  maxInitialRegistration?: string
  searchTerm?: string
  fuelType?: number
  gearBoxType?: number
  doorCountType?: number
  varnishBaseColorType?: number
  interiorBaseColorType?: number
  isVatDeductable?: string | boolean
  equipmentIds?: string[]
  carIds?: string[]
  orderBy?: WebshopCarOrderBy
  paginator?: WebshopCarQueryPaginator
  isValidForSale?: boolean
  hasConditionDocumentUrls?: boolean
  hasImages?: boolean
  minDoors?: number
  maxDoors?: number
  imagesToCrop?: number
  locationNames?: string[]
  usedConditionTypes?: string[]
  monthlyFinancingRateExampleMin?: number
  monthlyFinancingRateExampleMax?: number
  qualitySeals?: string[]
  marketingCampaigns?: string[]
  isAvailableInstantly?: boolean
  hasenVkvLabelDocumentUrl?: boolean
  carTypes?: string[]
  vehicleSubTypes?: string[]
  fuelTypes?: string[]
  gearBoxTypes?: string[]
  interiorBaseColorTypes?: string[]
  varnishBaseColorTypes?: string[]
  engineCapacityMin?: number
  engineCapacityMax?: number
  totalWeightMin?: number
  totalWeightMax?: number
  lengthMin?: number
  lengthMax?: number
  sleepingPlacesMin?: number
  sleepingPlacesMax?: number
  vehicleDealerLocationIds?: string[]
  driveTypes?: string[]
  interiorTypes?: string[]
  hasInitialLeasingInstallment?: boolean
  seatsMax?: number
  seatsMin?: number
  minEngineCylinders?: number
  maxEngineCylinders?: number
  models?: string[]
  internalIds?: string[]
}

export interface WebshopAddressDto {
  id: string
  street: string
  houseNumber: string
  city: string
  zipCode: string
}

export interface WebshopCarDealerLocationDto {
  id: string
  carDealerAdminId: string
  name: string
  eMail: string
  phone: string
  locationType: number
  address: WebshopAddressDto
  companyName: string
  companyCeos: string
  companyUstId: string
  companyCommercialRegisterId: string
  companyCourtName: string
  locationId: string
  vwErnstDealerId: string | null
  autoUncleDepartmentId: string | null
  bankName: string | null
  iban: string | null
  bic: string | null
  tradeInWidgetUrl: string | null
  whatsAppBusinessLink: string | null
  santanderLeasingApiToken: string | null
}

export interface WebshopImageDto {
  position: number
  url: string
  type: number
}

export interface WebshopEquipmentDto {
  name: string
  category: number
  categoryToString: string
  equipmentKey: string
}

export interface WebshopTechnicalDetailDto {
  key: string
  value: string
}

export interface WebshopManufacturerInfoDto {
  manufacturer: string
  company: string
  streetAndHouseNumber: string
  zipCode: string
  city: string
  country: string
  phoneNumber: string
  email: string
}

// Superset DTO for /cars list and /cars/:id detail responses.
export interface WebshopCarDto {
  id: string
  vehicleDealerId: string
  vin: string
  internalId: string
  manufacturer: string
  model: string
  marketingTitle: string
  equipmentVariant: string
  carType: number
  carTypeToString: string
  carTypes: string[]
  vehicleSubTypes: string[]
  usedConditionType: number
  usedConditionTypeAsString?: string
  usedConditionAsString?: string
  validForSaleType?: number
  validForSaleTypeAsString?: string
  mileAge: number
  initialRegistration: string
  enginePower: number
  engineCapacity?: number
  engineCylinders?: number
  fuelType: number
  fuelTypeAsString: string
  driveType: number
  driveTypeToString: string
  engineDriveType?: number
  engineDriveTypeToString?: string | null
  gearBoxType: number
  gearBoxTypeAsString: string
  gearBoxName: string
  gears: number
  doors?: number
  seats?: number
  sleepingPlaces?: number
  price: number
  publicPrice: number
  oldPrice?: number | null
  previousPrice?: number | null
  publicOldPrice?: number | null
  publicPreviousPrice?: number | null
  vatDeductable: boolean
  monthlyFinancingRateExample?: number | null
  initialFinancingInstallment?: number | null
  initialLeasingInstallment?: number | null
  virtualFinancingMonthlyInstallment?: number | null
  virtualFinancingDeposit?: number | null
  virtualFinancingDuration?: number | null
  virtualFinancingFinalInstallment?: number | null
  virtualFinancingMileage?: number | null
  virtualLeasingMonthlyInstallment?: number | null
  virtualLeasingDeposit?: number | null
  virtualLeasingDuration?: number | null
  virtualLeasingMileage?: number | null
  financingProviderType?: number
  financingProviderTypeToString?: string
  leasingProviderType?: number
  leasingProviderTypeToString?: string
  location: string
  carDealerLocationId?: string
  carDealerLocation?: WebshopCarDealerLocationDto
  vehicleDetailsPageUrl: string
  images: WebshopImageDto[]
  impelSpinUrl?: string
  description?: string
  descriptionItems?: string[]
  technicalDetails?: WebshopTechnicalDetailDto[]
  equipments?: WebshopEquipmentDto[]
  conditionDescription?: string
  conditionDocumentUrls?: string[]
  conditionType?: number
  conditionTypeAsString?: string
  isSold: boolean
  reservedUntil?: string | null
  hadAccident?: boolean
  isDamaged?: boolean
  previousOwners?: number
  previousUsageType?: number
  previousUsageTypeToString?: string
  hsn?: string
  tsn?: string
  schwackeCode?: number
  qualitySeal?: string | null
  marketingCampaign?: string | null
  manufacturerInfo?: WebshopManufacturerInfoDto
  color?: string | null
  primaryColor?: string | null
  interiorPrimaryColor?: string
  interiorBaseColorType?: number
  interiorType?: number
  interiorTypeToString?: string
  varnishPrimaryColor?: string
  varnishBaseColorType?: number
  deliveryDate?: string
  availableFromDate?: string
  deliveryTime?: string | null
  earliestPossiblePickupDate?: string
  earliestPossibleDeliveryDate?: string
  countryCode?: string | null
  batteryCapacity?: number | null
  stateOfHealth?: number | null
  length?: number
  weightTotal?: number | null
  isE10Capable?: boolean
  requiresEnVkvLabel?: boolean
  enVkvLabelDocumentUrl?: string | null
  enVkvInformationStringsCard?: string[]
  enVkvInformationStringsDetails?: string[]
  co2Efficiency?: string
  co2ClassCombined?: string | null
  co2ClassWeightedCombined?: string | null
  co2ClassDischargedBattery?: string | null
  co2Emission?: number | null
  co2EmissionPlugInHybridAverage?: number | null
  co2EmissionWltp?: number | null
  co2EmissionWltpWeighted?: number | null
  emissionStandard?: number
  emissionStandardLetter?: string
  consumptionUrban?: number | null
  consumptionExtraUrban?: number | null
  consumptionAverage?: number | null
  consumptionElectricityAverage?: number | null
  consumptionPlugInHybridAverage?: number | null
  consumptionAverageWltp?: number | null
  consumptionAverageWltpWeighted?: number | null
  consumptionAverageWltpElectric?: number | null
  consumptionAverageWltpElectricWeighted?: number | null
  fuelConsumptionDischargedBatteryCombined?: number | null
  energyConsumptionCombined?: number | null
  energyConsumptionWeightedCombined?: number | null
  electricRange?: number | null
  electricRangeWltp?: number | null
  generalInspection?: string | null
  generalInspectionIsNew?: boolean
  statusType?: number
  statusTypeToString?: string
}

export const RESULT_SORT_OPTIONS: readonly SortOption[] = [
  { key: 'relevance', label: 'Relevanz' },
  { key: 'priceAsc', label: 'Preis aufsteigend' },
  { key: 'priceDesc', label: 'Preis absteigend' },
  { key: 'newest', label: 'Neueste zuerst' },
  { key: 'mileageAsc', label: 'Kilometer aufsteigend' }
]
