declare global {
  interface Window {
    __digital35ScriptLoaderCache__?: Map<string, Promise<void>>
  }
}

function getCache(): Map<string, Promise<void>> {
  if (!window.__digital35ScriptLoaderCache__) {
    window.__digital35ScriptLoaderCache__ = new Map<string, Promise<void>>()
  }

  return window.__digital35ScriptLoaderCache__
}

function findMatchingScriptTag(url: string): HTMLScriptElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]')).find((script) => {
      const src = script.getAttribute('src')
      return src === url
    }) ?? null
  )
}

function loadScript(url: string): Promise<void> {
  const cache = getCache()
  const existing = cache.get(url)
  if (existing) {
    return existing
  }

  const existingScriptTag = findMatchingScriptTag(url)
  if (existingScriptTag) {
    const promise = new Promise<void>((resolve, reject) => {
      if (customElements.get('custom-elements-wrapper')) {
        resolve()
        return
      }

      existingScriptTag.addEventListener('load', () => resolve(), { once: true })
      existingScriptTag.addEventListener(
        'error',
        () => reject(new Error(`Failed to load external script: ${url}`)),
        { once: true }
      )
    })

    cache.set(url, promise)
    return promise
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error(`Failed to load external script: ${url}`)),
      { once: true }
    )

    document.head.appendChild(script)
  })

  cache.set(url, promise)
  return promise
}

export function parseScriptUrls(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return []
  }

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export async function loadExternalScriptsOnce(urls: string[]): Promise<void> {
  const uniqueUrls = [...new Set(urls)]
  await Promise.all(uniqueUrls.map((url) => loadScript(url)))
}

export async function waitForCustomElementDefinition(
  tagName: string,
  timeoutMs = 10000
): Promise<void> {
  if (customElements.get(tagName)) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`Custom element "${tagName}" was not defined within ${timeoutMs}ms.`))
    }, timeoutMs)

    customElements
      .whenDefined(tagName)
      .then(() => {
        window.clearTimeout(timeout)
        resolve()
      })
      .catch((error) => {
        window.clearTimeout(timeout)
        reject(error)
      })
  })
}
