# Widgets als Custom HTML Components

Diese Anleitung beschreibt, wie in diesem Projekt neue Widgets als Custom Elements entwickelt werden, analog zu `src/widgets/filter`.

## Ziel

Ein Widget soll als eigener HTML-Tag nutzbar sein, z. B.:

```html
<auto-shop-filter-widget></auto-shop-filter-widget>
```

Die Registrierung und das Mounting laufen über den generischen Adapter in `src/widgets/adapter/createWidgetAdapter.ts`.

## Architektur

Empfohlene Struktur pro Widget:

```text
src/widgets/<widget-name>/
  AutoShopFilterWidget.vue
  index.ts
  components/
  composables/
  data/
  types/
  utils/
```

Zentrale Bausteine:

- `src/widgets/adapter/createWidgetAdapter.ts`
- `src/widgets/<widget-name>/index.ts` (nur Konfiguration + Exports)
- `src/widgets/<widget-name>/<WidgetComponent>.vue`

## 1) Widget-Komponente erstellen

Beispiel:

- `src/widgets/filter/AutoShopFilterWidget.vue`

Optional kann die Komponente Props wie `hostElement` oder widget-spezifische Props akzeptieren.

## 2) Widget-Entry mit Adapter erstellen

In `src/widgets/<widget-name>/index.ts` wird nur konfiguriert:

```ts
import MyWidget from './MyWidget.vue'
import { createWidgetAdapter } from '@/widgets/adapter/createWidgetAdapter'
import '@/styles/index.css'

const ATTRIBUTE_TO_PROP_MAP = {
  'results-child-selector': 'resultsChildSelector',
  'some-value': 'someValue',
  'is-enabled': 'isEnabled'
} as const

const BOOLEAN_ATTRIBUTES = ['is-enabled'] as const

const adapter = createWidgetAdapter({
  component: MyWidget,
  defaultTagName: 'my-widget',
  attributeToPropMap: ATTRIBUTE_TO_PROP_MAP,
  booleanAttributes: BOOLEAN_ATTRIBUTES,
  mountPointClassName: 'my-widget-root'
})

export const MY_WIDGET_TAG = adapter.defaultTagName
export const mountMyWidget = adapter.mount
export const unmountMyWidget = adapter.unmount
export const registerMyWidgetElement = adapter.registerElement

registerMyWidgetElement()

export { MyWidget }
```

## 3) Verwendung in HTML

Wichtig: Das Modul des Widgets muss geladen werden, damit das Custom Element registriert wird.

```html
<my-widget
  some-value="abc"
  is-enabled="true"
></my-widget>

<script type="module" src="/src/widgets/my-widget/index.ts"></script>
```

## 4) Attribute -> Props Mapping

Die Zuordnung passiert über `ATTRIBUTE_TO_PROP_MAP`.

Beispiel:

- HTML-Attribut: `results-child-selector`
- Prop im Vue-Widget: `resultsChildSelector`

Boolean-Attribute müssen zusätzlich in `BOOLEAN_ATTRIBUTES` stehen.

## 5) Host-Integration für externe DOM-Knoten

Wenn ein Widget externe Child-Elemente in einen internen Bereich umhängen soll, nutze:

- `src/utils/hostSlot.ts`

Empfohlenes Verhalten:

- `hostElement.querySelector(selector)` wenn ein Selector gesetzt ist
- sonst erstes Element-Child
- Restore auf Original-Position beim Unmount
- `MutationObserver`, falls Child später injiziert wird

## 6) Vite und Custom Elements

`vite.config.ts` enthält aktuell:

- `custom-elements-wrapper`
- `auto-shop-filter-widget`

Für neue Tags gibt es zwei Optionen:

1. Tag in `isCustomElement` ergänzen
2. Oder (besser langfristig) die Abhängigkeit davon reduzieren, wenn keine Unknown-Element-Warnungen relevant sind

## 7) Entwicklung und Checks

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

Alle neuen Widgets müssen diese Checks bestehen.

## 8) Konkretes Referenzbeispiel

Siehe vollständige Referenz:

- `src/widgets/filter/index.ts`
- `src/widgets/filter/AutoShopFilterWidget.vue`
- `src/widgets/adapter/createWidgetAdapter.ts`
- `src/utils/hostSlot.ts`
