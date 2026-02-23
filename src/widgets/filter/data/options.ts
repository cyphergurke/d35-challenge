import type { FilterOption } from '@/widgets/filter/types/filters'

export const markeOptions: FilterOption[] = [
  { id: 'marke-audi', label: 'Audi', value: 'Audi' },
  { id: 'marke-bmw', label: 'BMW', value: 'BMW' },
  { id: 'marke-mercedes', label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { id: 'marke-skoda', label: 'Skoda', value: 'Skoda' },
  { id: 'marke-volkswagen', label: 'Volkswagen', value: 'Volkswagen' }
]

export const modelOptions: FilterOption[] = [
  { id: 'model-3-series', label: '3 Series', value: '3 Series' },
  { id: 'model-a1', label: 'A1', value: 'A1' },
  { id: 'model-enyaq', label: 'Enyaq', value: 'Enyaq' },
  { id: 'model-glc', label: 'GLC', value: 'GLC' },
  { id: 'model-tiguan', label: 'Tiguan', value: 'Tiguan' }
]

export const categoryOptions: FilterOption[] = [
  { id: 'category-car', label: 'PKW', value: 'PKW' },
  { id: 'category-motorcycle', label: 'Motorrad', value: 'Motorrad' },
  { id: 'category-van', label: 'Transporter', value: 'Transporter' },
  { id: 'category-camper', label: 'Wohnmobil', value: 'Wohnmobil' },
  { id: 'category-truck', label: 'LKW', value: 'LKW' }
]

export const bodyTypeOptions: FilterOption[] = [
  { id: 'body-suv', label: 'SUV', value: 'SUV' },
  { id: 'body-limousine', label: 'Limousine', value: 'Limousine' },
  { id: 'body-kombi', label: 'Kombi', value: 'Kombi' },
  { id: 'body-coupe', label: 'Coupe', value: 'Coupe' },
  { id: 'body-cabrio', label: 'Cabrio', value: 'Cabrio' }
]

export const fuelOptions: FilterOption[] = [
  { id: 'fuel-benzin', label: 'Benzin', value: 'Benzin' },
  { id: 'fuel-diesel', label: 'Diesel', value: 'Diesel' },
  { id: 'fuel-hybrid', label: 'Hybrid', value: 'Hybrid' },
  { id: 'fuel-elektro', label: 'Elektro', value: 'Elektro' },
  { id: 'fuel-lpg', label: 'LPG', value: 'LPG' }
]

export const transmissionOptions: FilterOption[] = [
  { id: 'transmission-automatic', label: 'Automatik', value: 'Automatik' },
  { id: 'transmission-manual', label: 'Schaltgetriebe', value: 'Schaltgetriebe' }
]

export const conditionOptions: FilterOption[] = [
  { id: 'condition-new', label: 'Neu', value: 'Neu' },
  { id: 'condition-used', label: 'Gebraucht', value: 'Gebraucht' },
  { id: 'condition-demo', label: 'Vorfuehrfahrzeug', value: 'Vorfuehrfahrzeug' },
  { id: 'condition-yearly', label: 'Jahreswagen', value: 'Jahreswagen' }
]

export const financingOptions: FilterOption[] = [
  { id: 'financing-leasing', label: 'Leasing', value: 'Leasing' },
  { id: 'financing-abo', label: 'Abo', value: 'Abo' },
  { id: 'financing-kredit', label: 'Kredit', value: 'Kredit' },
  { id: 'financing-ratenkauf', label: 'Ratenkauf', value: 'Ratenkauf' },
  { id: 'financing-ballon', label: 'Ballonfinanzierung', value: 'Ballonfinanzierung' }
]

const currentYear = new Date().getFullYear()
export const yearOptions: FilterOption[] = Array.from({ length: currentYear - 1979 }, (_, index) => {
  const year = String(currentYear - index)
  return { id: `year-${year}`, label: year, value: year }
})

export const kilometerOptions: FilterOption[] = [
  '0',
  '5000',
  '10000',
  '20000',
  '30000',
  '40000',
  '50000',
  '75000',
  '100000',
  '125000',
  '150000',
  '200000',
  '250000'
].map((value) => ({ id: `kilometer-${value}`, label: value, value }))

export const seatOptions: FilterOption[] = [
  { id: 'seats-2', label: '2 Sitze', value: '2' },
  { id: 'seats-4', label: '4 Sitze', value: '4' },
  { id: 'seats-5', label: '5 Sitze', value: '5' },
  { id: 'seats-6', label: '6 Sitze', value: '6' },
  { id: 'seats-7', label: '7 Sitze', value: '7' },
  { id: 'seats-8', label: '8 Sitze', value: '8' },
  { id: 'seats-9', label: '9 Sitze', value: '9' }
]

export const doorOptions: FilterOption[] = [
  { id: 'doors-2-3', label: '2/3', value: '2/3' },
  { id: 'doors-4-5', label: '4/5', value: '4/5' },
  { id: 'doors-6plus', label: '6+', value: '6+' }
]

export const extraOptions: FilterOption[] = [
  { id: 'extra-klimaanlage', label: 'Klimaanlage', value: 'Klimaanlage' },
  { id: 'extra-klimaautomatik', label: 'Klimaautomatik', value: 'Klimaautomatik' },
  { id: 'extra-sitzheizung', label: 'Sitzheizung', value: 'Sitzheizung' },
  { id: 'extra-sitzbelueftung', label: 'Sitzbelueftung', value: 'Sitzbelueftung' },
  { id: 'extra-lederscheinwerfer', label: 'LED-Scheinwerfer', value: 'LED-Scheinwerfer' },
  { id: 'extra-xenon', label: 'Xenon', value: 'Xenon' },
  { id: 'extra-adaptives-licht', label: 'Adaptives Licht', value: 'Adaptives Licht' },
  { id: 'extra-navi', label: 'Navigationssystem', value: 'Navigationssystem' },
  { id: 'extra-apple-carplay', label: 'Apple CarPlay', value: 'Apple CarPlay' },
  { id: 'extra-android-auto', label: 'Android Auto', value: 'Android Auto' },
  { id: 'extra-bluetooth', label: 'Bluetooth', value: 'Bluetooth' },
  { id: 'extra-dab', label: 'DAB Radio', value: 'DAB Radio' },
  { id: 'extra-tempomat', label: 'Tempomat', value: 'Tempomat' },
  { id: 'extra-adaptiver-tempomat', label: 'Adaptiver Tempomat', value: 'Adaptiver Tempomat' },
  { id: 'extra-spurhalteassistent', label: 'Spurhalteassistent', value: 'Spurhalteassistent' },
  { id: 'extra-totwinkelassistent', label: 'Totwinkelassistent', value: 'Totwinkelassistent' },
  { id: 'extra-notbremsassistent', label: 'Notbremsassistent', value: 'Notbremsassistent' },
  { id: 'extra-einparkhilfe', label: 'Einparkhilfe', value: 'Einparkhilfe' },
  { id: 'extra-rueckfahrkamera', label: 'Rueckfahrkamera', value: 'Rueckfahrkamera' },
  { id: 'extra-360-kamera', label: '360 Kamera', value: '360 Kamera' },
  { id: 'extra-panorama', label: 'Panoramadach', value: 'Panoramadach' },
  { id: 'extra-ahk', label: 'Anhaengerkupplung', value: 'Anhaengerkupplung' },
  { id: 'extra-allrad', label: 'Allradantrieb', value: 'Allradantrieb' },
  { id: 'extra-sportsitze', label: 'Sportsitze', value: 'Sportsitze' },
  { id: 'extra-leder', label: 'Lederausstattung', value: 'Lederausstattung' },
  { id: 'extra-keyless', label: 'Keyless Entry', value: 'Keyless Entry' }
]

export const maxKilometerValue = kilometerOptions[kilometerOptions.length - 1]?.value ?? '250000'
