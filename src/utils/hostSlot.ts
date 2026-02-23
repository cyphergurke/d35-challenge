export interface MountHostChildParams {
  hostElement?: HTMLElement | null
  selector?: string
  targetElement: HTMLElement
}

export interface HostChildMountResult {
  mounted: boolean
  unmount: () => void
}

interface RestorePoint {
  parent: Node
  nextSibling: ChildNode | null
}

function isEligibleCandidate(element: Element | null, targetElement: HTMLElement): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element !== targetElement &&
    !element.contains(targetElement) &&
    !targetElement.contains(element)
  )
}

function pickHostChild(
  hostElement: HTMLElement,
  selector: string | undefined,
  targetElement: HTMLElement
): HTMLElement | null {
  if (selector) {
    const selected = hostElement.querySelector(selector)
    return isEligibleCandidate(selected, targetElement) ? selected : null
  }

  for (const child of Array.from(hostElement.children)) {
    if (isEligibleCandidate(child, targetElement)) {
      return child
    }
  }

  return null
}

function restoreElement(element: HTMLElement, restorePoint: RestorePoint): void {
  const { parent, nextSibling } = restorePoint

  if (nextSibling && nextSibling.parentNode === parent) {
    parent.insertBefore(element, nextSibling)
    return
  }

  parent.appendChild(element)
}

export function mountHostChild(params: MountHostChildParams): HostChildMountResult {
  const { hostElement, selector, targetElement } = params
  if (!hostElement) {
    return { mounted: false, unmount: () => undefined }
  }

  let movedElement: HTMLElement | null = null
  let restorePoint: RestorePoint | null = null
  let observer: MutationObserver | null = null

  const tryMount = (): boolean => {
    if (movedElement) {
      return true
    }

    const candidate = pickHostChild(hostElement, selector, targetElement)
    if (!candidate) {
      return false
    }

    const parent = candidate.parentNode
    if (!parent) {
      return false
    }

    restorePoint = { parent, nextSibling: candidate.nextSibling }
    targetElement.appendChild(candidate)
    movedElement = candidate
    return true
  }

  const mounted = tryMount()

  if (!mounted) {
    observer = new MutationObserver(() => {
      if (!tryMount()) {
        return
      }

      observer?.disconnect()
      observer = null
    })

    observer.observe(hostElement, { childList: true, subtree: true })
  }

  return {
    mounted,
    unmount: () => {
      observer?.disconnect()
      observer = null

      if (!movedElement || !restorePoint) {
        return
      }

      restoreElement(movedElement, restorePoint)
      movedElement = null
      restorePoint = null
    }
  }
}
