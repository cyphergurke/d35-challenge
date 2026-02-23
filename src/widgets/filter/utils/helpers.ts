const ALLOWED_NAVIGATION_KEYS = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Home',
  'End'
])

const SHORTCUT_KEYS = new Set(['a', 'c', 'v', 'x'])

export function sanitizeNumericInput(value: string | number): string {
  return String(value).replace(/\D+/g, '')
}

export function isAllowedPriceKey(event: KeyboardEvent): boolean {
  const isShortcut = (event.ctrlKey || event.metaKey) && SHORTCUT_KEYS.has(event.key.toLowerCase())
  if (ALLOWED_NAVIGATION_KEYS.has(event.key) || isShortcut) {
    return true
  }

  return /^\d$/.test(event.key)
}

export function isValidNumericPaste(event: ClipboardEvent): boolean {
  const pastedText = event.clipboardData?.getData('text') ?? ''
  return /^\d*$/.test(pastedText)
}
