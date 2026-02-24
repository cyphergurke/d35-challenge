<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BellRing, Bookmark, Mail, Save, Send, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  deleteSavedSearch,
  listSavedSearches,
  createSavedSearch,
  updateSavedSearch
} from '@/api/savedSearchApi'
import {
  createSearchAlert,
  deleteSearchAlert,
  listSearchAlerts,
  sendSearchAlertTest,
  updateSearchAlert
} from '@/api/searchAlertApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildAppliedFiltersFromState } from '@/widgets/filter/results/buildAppliedFilters'
import type { SortKey } from '@/widgets/filter/results/types'
import {
  buildSavedSearchName,
  cloneFilterState,
  type SearchAlert,
  type SearchAlertChannel,
  type SearchAlertFrequency,
  type SavedSearch
} from '@/widgets/filter/results/searchModels'
import type { FilterState } from '@/widgets/filter/types/filters'

interface Props {
  open: boolean
  currentFilters: FilterState
  currentSortKey: SortKey
  defaultTarget?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultTarget: 'user@email.tld'
})

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (
    event: 'apply-saved-search',
    payload: { filters: FilterState; sortKey: SortKey }
  ): void
}>()

type DialogTab = 'alerts' | 'saved'
type SavedListSort = 'newest' | 'alphabetical'

const activeTab = ref<DialogTab>('alerts')
const savedListSort = ref<SavedListSort>('newest')
const isLoading = ref(false)
const isMutating = ref(false)
const feedbackMessage = ref<string | null>(null)

const savedSearches = ref<SavedSearch[]>([])
const searchAlerts = ref<SearchAlert[]>([])
const renameDrafts = ref<Record<string, string>>({})

const selectedSavedSearchId = ref<string | null>(null)
const selectedAlertId = ref<string | null>(null)

const alertName = ref('')
const alertIsActive = ref(true)
const alertChannel = ref<SearchAlertChannel>('email')
const alertTarget = ref(props.defaultTarget)
const alertFrequency = ref<SearchAlertFrequency>('instant')
const alertOnlyOnNew = ref(true)
const alertDedupeSeen = ref(true)
const alertQuietHoursEnabled = ref(false)
const alertQuietStart = ref('22:00')
const alertQuietEnd = ref('07:00')
const alertQuietTimezone = ref(
  typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin'
    : 'Europe/Berlin'
)

const isBusy = computed(() => isLoading.value || isMutating.value)

const sortedSavedSearches = computed(() => {
  const items = [...savedSearches.value]
  if (savedListSort.value === 'alphabetical') {
    items.sort((left, right) => left.name.localeCompare(right.name, 'de'))
    return items
  }

  items.sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  )
  return items
})

const maxNotificationsHint = computed(() => {
  switch (alertFrequency.value) {
    case 'instant':
      return '12'
    case 'daily':
      return '1'
    case 'weekly':
      return '1 pro Woche'
    default:
      return '1'
  }
})

function formatFrequency(frequency: SearchAlertFrequency): string {
  switch (frequency) {
    case 'instant':
      return 'Sofort'
    case 'daily':
      return '1x taeglich'
    case 'weekly':
      return '1x woechentlich'
    default:
      return frequency
  }
}

function formatChannel(channel: SearchAlertChannel): string {
  return channel === 'email' ? 'E-Mail' : 'Push'
}

function formatAbsoluteDate(value?: string): string {
  if (!value) {
    return '-'
  }

  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) {
    return '-'
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(parsed))
}

function formatRelativeDate(isoDate: string): string {
  const timestamp = Date.parse(isoDate)
  if (!Number.isFinite(timestamp)) {
    return 'gespeichert vor kurzem'
  }

  const diffMs = Date.now() - timestamp
  const diffDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)))

  if (diffDays === 1) {
    return 'gespeichert vor 1 Tag'
  }

  return `gespeichert vor ${diffDays} Tagen`
}

function getSearchChips(search: SavedSearch): string[] {
  const labels = buildAppliedFiltersFromState(search.query.filters).map(
    (item) => item.label
  )
  if (labels.length > 0) {
    return labels.slice(0, 4)
  }

  return ['Keine Filter gesetzt']
}

function getCurrentQuery(): SavedSearch['query'] {
  return {
    filters: cloneFilterState(props.currentFilters),
    sortKey: props.currentSortKey
  }
}

function queryFingerprint(query: SavedSearch['query']): string {
  return JSON.stringify(query)
}

function resetAlertFormToCurrentSearch(): void {
  selectedAlertId.value = null
  selectedSavedSearchId.value = null
  alertName.value = buildSavedSearchName(props.currentFilters)
  alertIsActive.value = true
  alertChannel.value = 'email'
  alertTarget.value = props.defaultTarget
  alertFrequency.value = 'instant'
  alertOnlyOnNew.value = true
  alertDedupeSeen.value = true
  alertQuietHoursEnabled.value = false
  alertQuietStart.value = '22:00'
  alertQuietEnd.value = '07:00'
}

function updateRenameDraft(savedSearchId: string, value: string): void {
  renameDrafts.value = {
    ...renameDrafts.value,
    [savedSearchId]: value
  }
}

function setOnlyOnNew(checked: boolean | 'indeterminate'): void {
  alertOnlyOnNew.value = checked === true
}

function setDedupeSeen(checked: boolean | 'indeterminate'): void {
  alertDedupeSeen.value = checked === true
}

function setQuietHoursEnabled(checked: boolean | 'indeterminate'): void {
  alertQuietHoursEnabled.value = checked === true
}

function syncRenameDrafts(nextSavedSearches: SavedSearch[]): void {
  const nextDrafts: Record<string, string> = {}
  for (const item of nextSavedSearches) {
    nextDrafts[item.id] = renameDrafts.value[item.id] ?? item.name
  }

  renameDrafts.value = nextDrafts
}

function notifySuccess(message: string): void {
  feedbackMessage.value = message
  toast.success(message)
}

function notifyInfo(message: string): void {
  feedbackMessage.value = message
  toast.info(message)
}

function notifyError(message: string): void {
  feedbackMessage.value = message
  toast.error(message)
}

async function refreshData(): Promise<void> {
  const [savedItems, alertItems] = await Promise.all([
    listSavedSearches(),
    listSearchAlerts()
  ])
  savedSearches.value = savedItems
  searchAlerts.value = alertItems
  syncRenameDrafts(savedItems)
}

function loadAlertIntoForm(alert: SearchAlert): void {
  selectedAlertId.value = alert.id
  selectedSavedSearchId.value = alert.savedSearchId

  const savedSearch = savedSearches.value.find(
    (item) => item.id === alert.savedSearchId
  )
  alertName.value =
    savedSearch?.name ?? buildSavedSearchName(props.currentFilters)
  alertIsActive.value = alert.isActive
  alertChannel.value = alert.channel
  alertTarget.value = alert.target
  alertFrequency.value = alert.frequency
  alertOnlyOnNew.value = alert.onlyOnNew
  alertDedupeSeen.value = alert.dedupeSeen

  if (alert.quietHours) {
    alertQuietHoursEnabled.value = true
    alertQuietStart.value = alert.quietHours.start
    alertQuietEnd.value = alert.quietHours.end
    alertQuietTimezone.value = alert.quietHours.timezone
    return
  }

  alertQuietHoursEnabled.value = false
  alertQuietStart.value = '22:00'
  alertQuietEnd.value = '07:00'
}

async function initializeDialog(): Promise<void> {
  feedbackMessage.value = null
  isLoading.value = true

  try {
    await refreshData()

    if (selectedAlertId.value) {
      const activeAlert = searchAlerts.value.find(
        (item) => item.id === selectedAlertId.value
      )
      if (activeAlert) {
        loadAlertIntoForm(activeAlert)
        return
      }
    }

    resetAlertFormToCurrentSearch()
  } catch {
    notifyError('Suchauftraege konnten nicht geladen werden.')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    void initializeDialog()
  }
)

watch(
  () => props.currentFilters,
  () => {
    if (!props.open || selectedAlertId.value) {
      return
    }

    alertName.value = buildSavedSearchName(props.currentFilters)
  },
  { deep: true }
)

async function saveCurrentSearchRecord(
  preferredName?: string
): Promise<SavedSearch> {
  const query = getCurrentQuery()
  const matchingByQuery = savedSearches.value.find(
    (item) => queryFingerprint(item.query) === queryFingerprint(query)
  )

  const selectedSavedSearch = selectedSavedSearchId.value
    ? savedSearches.value.find(
        (item) => item.id === selectedSavedSearchId.value
      )
    : undefined

  const existing = selectedSavedSearch ?? matchingByQuery
  const resolvedName = (
    preferredName ??
    existing?.name ??
    buildSavedSearchName(query.filters)
  ).trim()

  const nextSavedSearch = existing
    ? await updateSavedSearch(existing.id, { name: resolvedName, query })
    : await createSavedSearch({ name: resolvedName, query })

  selectedSavedSearchId.value = nextSavedSearch.id
  await refreshData()
  return nextSavedSearch
}

async function saveCurrentSearchFromToolbar(): Promise<void> {
  isMutating.value = true

  try {
    await refreshData()
    await saveCurrentSearchRecord()
    notifySuccess('Aktuelle Suche gespeichert.')
  } catch {
    notifyError('Aktuelle Suche konnte nicht gespeichert werden.')
  } finally {
    isMutating.value = false
  }
}

function openAlertsTab(): void {
  activeTab.value = 'alerts'
  emit('update:open', true)
}

defineExpose({
  openAlertsTab,
  saveCurrentSearchFromToolbar
})

async function handleSaveCurrentSearch(): Promise<void> {
  isMutating.value = true

  try {
    await saveCurrentSearchRecord(alertName.value)
    notifySuccess('Aktuelle Suche gespeichert.')
  } catch {
    notifyError('Aktuelle Suche konnte nicht gespeichert werden.')
  } finally {
    isMutating.value = false
  }
}

async function handleUpsertAlert(): Promise<void> {
  const isUpdate = selectedAlertId.value !== null

  isMutating.value = true

  try {
    const savedSearch = await saveCurrentSearchRecord(alertName.value)

    const quietHours = alertQuietHoursEnabled.value
      ? {
          start: alertQuietStart.value,
          end: alertQuietEnd.value,
          timezone: alertQuietTimezone.value
        }
      : null

    const normalizedTarget = alertTarget.value.trim() || props.defaultTarget

    let alert: SearchAlert
    if (isUpdate && selectedAlertId.value) {
      alert = await updateSearchAlert(selectedAlertId.value, {
        savedSearchId: savedSearch.id,
        isActive: alertIsActive.value,
        channel: alertChannel.value,
        target: normalizedTarget,
        frequency: alertFrequency.value,
        onlyOnNew: alertOnlyOnNew.value,
        dedupeSeen: alertDedupeSeen.value,
        quietHours
      })
    } else {
      alert = await createSearchAlert({
        savedSearchId: savedSearch.id,
        isActive: alertIsActive.value,
        channel: alertChannel.value,
        target: normalizedTarget,
        frequency: alertFrequency.value,
        onlyOnNew: alertOnlyOnNew.value,
        dedupeSeen: alertDedupeSeen.value,
        quietHours: quietHours ?? undefined
      })
    }

    await refreshData()

    const refreshedAlert = searchAlerts.value.find(
      (item) => item.id === alert.id
    )
    if (refreshedAlert) {
      loadAlertIntoForm(refreshedAlert)
    }

    notifySuccess(
      isUpdate ? 'Suchauftrag aktualisiert.' : 'Suchauftrag erstellt.'
    )
  } catch {
    notifyError('Suchauftrag konnte nicht gespeichert werden.')
  } finally {
    isMutating.value = false
  }
}

async function handleSendTest(): Promise<void> {
  if (!selectedAlertId.value) {
    return
  }

  isMutating.value = true

  try {
    await sendSearchAlertTest(selectedAlertId.value)
    await refreshData()
    notifySuccess('Testmail wurde simuliert.')
  } catch {
    notifyError('Testmail konnte nicht gesendet werden.')
  } finally {
    isMutating.value = false
  }
}

async function handleDeleteAlert(): Promise<void> {
  if (!selectedAlertId.value) {
    return
  }

  isMutating.value = true

  try {
    await deleteSearchAlert(selectedAlertId.value)
    await refreshData()
    resetAlertFormToCurrentSearch()
    notifySuccess('Suchauftrag geloescht.')
  } catch {
    notifyError('Suchauftrag konnte nicht geloescht werden.')
  } finally {
    isMutating.value = false
  }
}

function handleSelectAlert(alert: SearchAlert): void {
  loadAlertIntoForm(alert)
}

function handleApplySavedSearch(savedSearch: SavedSearch): void {
  emit('apply-saved-search', {
    filters: cloneFilterState(savedSearch.query.filters),
    sortKey: savedSearch.query.sortKey
  })
  notifySuccess('Gespeicherte Suche angewendet.')
  emit('update:open', false)
}

async function handleActivateAlert(savedSearch: SavedSearch): Promise<void> {
  const existingAlert = searchAlerts.value.find(
    (item) => item.savedSearchId === savedSearch.id
  )
  if (existingAlert) {
    activeTab.value = 'alerts'
    loadAlertIntoForm(existingAlert)
    notifyInfo('Suchauftrag existiert bereits und wurde geladen.')
    return
  }

  isMutating.value = true

  try {
    const created = await createSearchAlert({
      savedSearchId: savedSearch.id,
      isActive: true,
      channel: 'email',
      target: alertTarget.value.trim() || props.defaultTarget,
      frequency: 'instant',
      onlyOnNew: true,
      dedupeSeen: true
    })

    await refreshData()

    const refreshedAlert = searchAlerts.value.find(
      (item) => item.id === created.id
    )
    if (refreshedAlert) {
      loadAlertIntoForm(refreshedAlert)
    }

    activeTab.value = 'alerts'
    notifySuccess('Suchauftrag aktiviert.')
  } catch {
    notifyError('Suchauftrag konnte nicht aktiviert werden.')
  } finally {
    isMutating.value = false
  }
}

async function handleRenameSavedSearch(
  savedSearch: SavedSearch
): Promise<void> {
  const draftName = (
    renameDrafts.value[savedSearch.id] ?? savedSearch.name
  ).trim()
  if (!draftName || draftName === savedSearch.name) {
    return
  }

  isMutating.value = true

  try {
    await updateSavedSearch(savedSearch.id, { name: draftName })
    await refreshData()

    if (selectedSavedSearchId.value === savedSearch.id) {
      alertName.value = draftName
    }

    notifySuccess('Suche umbenannt.')
  } catch {
    notifyError('Suche konnte nicht umbenannt werden.')
  } finally {
    isMutating.value = false
  }
}

async function handleDeleteSavedSearch(
  savedSearch: SavedSearch
): Promise<void> {
  isMutating.value = true

  try {
    const linkedAlerts = searchAlerts.value.filter(
      (item) => item.savedSearchId === savedSearch.id
    )
    for (const alert of linkedAlerts) {
      await deleteSearchAlert(alert.id)
    }

    await deleteSavedSearch(savedSearch.id)
    await refreshData()

    if (selectedSavedSearchId.value === savedSearch.id) {
      resetAlertFormToCurrentSearch()
    }

    notifySuccess('Gespeicherte Suche geloescht.')
  } catch {
    notifyError('Gespeicherte Suche konnte nicht geloescht werden.')
  } finally {
    isMutating.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
    <DialogScrollContent
      class="max-h-[92vh] max-w-[1100px] border-[#c8d2de] bg-[#f8fafd] p-0"
    >
      <div class="space-y-4 p-5">
        <DialogHeader>
          <DialogTitle class="text-xl text-[#1f2a3a]">Suchauftrag</DialogTitle>
          <DialogDescription class="text-[#5c7292]">
            Benachrichtige mich, wenn neue Fahrzeuge passen.
          </DialogDescription>
        </DialogHeader>

        <Tabs v-model="activeTab">
          <TabsList class="grid w-full grid-cols-2 bg-[#eaf0f7]">
            <TabsTrigger value="alerts" class="gap-2">
              <BellRing class="size-4" />
              Suchauftraege
            </TabsTrigger>
            <TabsTrigger value="saved" class="gap-2">
              <Bookmark class="size-4" />
              Gespeicherte Suchen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" class="space-y-4">
            <section class="rounded-xl border border-[#c8d2de] bg-white p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-semibold text-[#22324a]">
                    Aktuelle Suche
                  </h3>
                  <p class="text-sm text-[#607794]">
                    Benachrichtigungsprofil fuer deine aktuelle Suche.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-[#4f6788]">
                    {{ alertIsActive ? 'Aktiv' : 'Inaktiv' }}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="alertIsActive"
                    class="relative inline-flex h-7 w-12 items-center rounded-full border border-[#c9d4e3] bg-[#e4ebf4] p-1 transition"
                    :class="alertIsActive ? 'bg-[#d8ebff]' : ''"
                    @click="alertIsActive = !alertIsActive"
                  >
                    <span
                      class="h-5 w-5 rounded-full bg-white shadow-sm transition"
                      :class="alertIsActive ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>

              <div class="mt-4 grid gap-3 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label
                    for="alert-name"
                    class="text-xs font-medium text-[#48617f]"
                    >Name</label
                  >
                  <Input
                    id="alert-name"
                    v-model="alertName"
                    class="border-[#d6dfeb]"
                  />
                </div>

                <div class="space-y-1.5">
                  <label
                    for="alert-channel"
                    class="text-xs font-medium text-[#48617f]"
                    >Kanal</label
                  >
                  <Select v-model="alertChannel">
                    <SelectTrigger
                      id="alert-channel"
                      class="border-[#d6dfeb] bg-white"
                    >
                      <SelectValue placeholder="Kanal waehlen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-1.5 md:col-span-2">
                  <label
                    for="alert-target"
                    class="text-xs font-medium text-[#48617f]"
                    >Empfaenger</label
                  >
                  <Input
                    id="alert-target"
                    v-model="alertTarget"
                    class="border-[#d6dfeb]"
                  />
                </div>

                <fieldset class="space-y-2 md:col-span-2">
                  <legend class="text-xs font-medium text-[#48617f]">
                    Frequenz
                  </legend>
                  <div class="grid gap-2 md:grid-cols-3">
                    <label
                      class="flex items-center gap-2 rounded-lg border border-[#d4deea] p-2 text-sm text-[#2a3b53]"
                    >
                      <input
                        v-model="alertFrequency"
                        type="radio"
                        name="alert-frequency"
                        value="instant"
                        class="h-4 w-4"
                      />
                      Sofort (bei neuen Treffern)
                    </label>
                    <label
                      class="flex items-center gap-2 rounded-lg border border-[#d4deea] p-2 text-sm text-[#2a3b53]"
                    >
                      <input
                        v-model="alertFrequency"
                        type="radio"
                        name="alert-frequency"
                        value="daily"
                        class="h-4 w-4"
                      />
                      1x taeglich
                    </label>
                    <label
                      class="flex items-center gap-2 rounded-lg border border-[#d4deea] p-2 text-sm text-[#2a3b53]"
                    >
                      <input
                        v-model="alertFrequency"
                        type="radio"
                        name="alert-frequency"
                        value="weekly"
                        class="h-4 w-4"
                      />
                      1x woechentlich
                    </label>
                  </div>
                </fieldset>

                <div class="space-y-2 md:col-span-2">
                  <label class="flex items-start gap-2 text-sm text-[#2a3b53]">
                    <Checkbox
                      :checked="alertOnlyOnNew"
                      @update:checked="setOnlyOnNew"
                    />
                    <span
                      >Nur benachrichtigen, wenn neue Inserate hinzugekommen
                      sind.</span
                    >
                  </label>
                  <label class="flex items-start gap-2 text-sm text-[#2a3b53]">
                    <Checkbox
                      :checked="alertDedupeSeen"
                      @update:checked="setDedupeSeen"
                    />
                    <span
                      >Keine Benachrichtigung fuer Anzeigen, die du bereits
                      gesehen hast.</span
                    >
                  </label>
                </div>

                <details
                  class="rounded-lg border border-[#d4deea] p-3 md:col-span-2"
                >
                  <summary
                    class="cursor-pointer text-sm font-medium text-[#35507a]"
                  >
                    Erweitert: Ruhezeiten
                  </summary>
                  <div class="mt-3 space-y-3">
                    <label
                      class="flex items-start gap-2 text-sm text-[#2a3b53]"
                    >
                      <Checkbox
                        :checked="alertQuietHoursEnabled"
                        @update:checked="setQuietHoursEnabled"
                      />
                      <span>Nicht stoeren aktivieren</span>
                    </label>

                    <div class="grid gap-2 md:grid-cols-3">
                      <div class="space-y-1">
                        <label for="quiet-start" class="text-xs text-[#5e7696]"
                          >Von</label
                        >
                        <Input
                          id="quiet-start"
                          v-model="alertQuietStart"
                          type="time"
                          :disabled="!alertQuietHoursEnabled"
                        />
                      </div>
                      <div class="space-y-1">
                        <label for="quiet-end" class="text-xs text-[#5e7696]"
                          >Bis</label
                        >
                        <Input
                          id="quiet-end"
                          v-model="alertQuietEnd"
                          type="time"
                          :disabled="!alertQuietHoursEnabled"
                        />
                      </div>
                      <div class="space-y-1">
                        <label for="quiet-zone" class="text-xs text-[#5e7696]"
                          >Zeitzone</label
                        >
                        <Input
                          id="quiet-zone"
                          v-model="alertQuietTimezone"
                          :disabled="!alertQuietHoursEnabled"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <p class="mt-3 text-xs text-[#68809f]">
                Wir senden maximal {{ maxNotificationsHint }} Benachrichtigungen
                pro Tag.
              </p>

              <div class="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  class="bg-[#2d72e8] text-white hover:bg-[#1f66e0]"
                  :disabled="isBusy"
                  @click="handleUpsertAlert"
                >
                  <BellRing class="size-4" />
                  {{
                    selectedAlertId
                      ? 'Suchauftrag aktualisieren'
                      : 'Suchauftrag erstellen'
                  }}
                </Button>
                <Button
                  variant="outline"
                  :disabled="isBusy || !selectedAlertId"
                  @click="handleSendTest"
                >
                  <Send class="size-4" />
                  Testmail senden
                </Button>
                <Button
                  variant="destructive"
                  :disabled="isBusy || !selectedAlertId"
                  @click="handleDeleteAlert"
                >
                  <Trash2 class="size-4" />
                  Suchauftrag loeschen
                </Button>
              </div>
            </section>

            <section class="rounded-xl border border-[#c8d2de] bg-white p-4">
              <div class="mb-3 flex items-center justify-between gap-2">
                <h3 class="text-base font-semibold text-[#22324a]">
                  Bestehende Suchauftraege
                </h3>
                <Badge
                  variant="secondary"
                  class="border border-[#d4deea] bg-[#edf3fb] text-[#35507a]"
                >
                  {{ searchAlerts.length }}
                </Badge>
              </div>

              <div
                v-if="searchAlerts.length === 0"
                class="rounded-lg border border-dashed border-[#cad6e6] p-4 text-sm text-[#6d829f]"
              >
                Noch keine Suchauftraege vorhanden.
              </div>

              <div
                v-else
                class="overflow-x-auto rounded-lg border border-[#d4deea]"
              >
                <table class="w-full min-w-[720px] text-left text-sm">
                  <thead
                    class="bg-[#f4f7fb] text-xs uppercase tracking-wide text-[#5f7594]"
                  >
                    <tr>
                      <th class="px-3 py-2">Name</th>
                      <th class="px-3 py-2">Frequenz</th>
                      <th class="px-3 py-2">Kanal</th>
                      <th class="px-3 py-2">Letzte Benachrichtigung</th>
                      <th class="px-3 py-2">Status</th>
                      <th class="px-3 py-2">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="alert in searchAlerts"
                      :key="alert.id"
                      class="border-t border-[#e0e7f0]"
                      :class="
                        selectedAlertId === alert.id
                          ? 'bg-[#edf4ff]'
                          : 'bg-white'
                      "
                    >
                      <td class="px-3 py-2 font-medium text-[#22324a]">
                        {{
                          savedSearches.find(
                            (item) => item.id === alert.savedSearchId
                          )?.name ?? 'Unbenannte Suche'
                        }}
                      </td>
                      <td class="px-3 py-2 text-[#4c6382]">
                        {{ formatFrequency(alert.frequency) }}
                      </td>
                      <td class="px-3 py-2 text-[#4c6382]">
                        {{ formatChannel(alert.channel) }}
                      </td>
                      <td class="px-3 py-2 text-[#4c6382]">
                        {{ formatAbsoluteDate(alert.lastNotifiedAt) }}
                      </td>
                      <td class="px-3 py-2">
                        <Badge
                          :variant="alert.isActive ? 'default' : 'secondary'"
                        >
                          {{ alert.isActive ? 'Aktiv' : 'Inaktiv' }}
                        </Badge>
                      </td>
                      <td class="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="handleSelectAlert(alert)"
                          >Bearbeiten</Button
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="saved" class="space-y-4">
            <section class="rounded-xl border border-[#c8d2de] bg-white p-4">
              <div
                class="mb-3 flex flex-wrap items-center justify-between gap-2"
              >
                <Button
                  variant="outline"
                  class="border-[#d4deea] bg-[#f7fbff] text-[#2f64c6]"
                  :disabled="isBusy"
                  @click="handleSaveCurrentSearch"
                >
                  <Save class="size-4" />
                  Aktuelle Suche speichern
                </Button>

                <Select v-model="savedListSort">
                  <SelectTrigger class="w-[220px] border-[#d4deea] bg-white">
                    <SelectValue placeholder="Sortierung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Neueste zuerst</SelectItem>
                    <SelectItem value="alphabetical">Alphabetisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                v-if="sortedSavedSearches.length === 0"
                class="rounded-lg border border-dashed border-[#cad6e6] p-4 text-sm text-[#6d829f]"
              >
                Noch keine gespeicherten Suchen vorhanden.
              </div>

              <div v-else class="space-y-3">
                <article
                  v-for="savedSearch in sortedSavedSearches"
                  :key="savedSearch.id"
                  class="rounded-lg border border-[#d5dfec] bg-[#fbfdff] p-3"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0 flex-1 space-y-2">
                      <Input
                        :model-value="
                          renameDrafts[savedSearch.id] ?? savedSearch.name
                        "
                        class="h-8 border-[#d4deea]"
                        @update:model-value="
                          (value) =>
                            updateRenameDraft(savedSearch.id, String(value))
                        "
                        @keydown.enter.prevent="
                          handleRenameSavedSearch(savedSearch)
                        "
                      />

                      <div class="flex flex-wrap gap-1.5">
                        <Badge
                          v-for="chip in getSearchChips(savedSearch)"
                          :key="`${savedSearch.id}-${chip}`"
                          variant="secondary"
                          class="border border-[#cad8ea] bg-[#edf3fb] text-[#314c6f]"
                        >
                          {{ chip }}
                        </Badge>
                      </div>

                      <p class="text-xs text-[#7289a7]">
                        {{ formatRelativeDate(savedSearch.createdAt) }}
                      </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        @click="handleApplySavedSearch(savedSearch)"
                        >Anwenden</Button
                      >
                      <Button
                        size="sm"
                        variant="outline"
                        @click="handleActivateAlert(savedSearch)"
                      >
                        Als Suchauftrag aktivieren
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        @click="handleRenameSavedSearch(savedSearch)"
                      >
                        Umbenennen
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        @click="handleDeleteSavedSearch(savedSearch)"
                      >
                        Loeschen
                      </Button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <Separator class="bg-[#d6dfeb]" />

        <div class="flex items-center justify-between gap-2 text-sm">
          <span class="inline-flex items-center gap-1 text-[#607794]">
            <Mail class="size-4" />
            Kontaktierbar unter {{ alertTarget || props.defaultTarget }}
          </span>
          <span class="text-[#3b5f94]">{{ feedbackMessage ?? 'Bereit' }}</span>
        </div>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
