# AutoShop Filter Widget

Vue 3 + TypeScript project scaffolded with Vite and structured for future embeddable widget/library builds.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Preview

```bash
pnpm preview
```

## Nutzung als WebComponent

```html
<digital35-meinfahrzeugshop-suche></digital35-meinfahrzeugshop-suche>
<script type="module" src="/src/widgets/filter/index.ts"></script>
```

Optional koennen Konfigurations-Attribute direkt am Tag gesetzt werden, z. B.:
`client-base-url`, `api-base-url`, `cdn-url`, `query-params`, `script-urls`.

## Dokumentation

- Widget-Entwicklung als Custom HTML Component: `docs/widgets.md`
