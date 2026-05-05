const registry = new Map<string, DOMRect>()

export function registerPulseTarget(id: string, el: HTMLElement | null): void {
  if (el) registry.set(id, el.getBoundingClientRect())
}

export function unregisterPulseTarget(id: string): void {
  registry.delete(id)
}

export function getPulseTarget(id: string): DOMRect | null {
  return registry.get(id) ?? null
}

export function refreshPulseTarget(id: string): void {
  const el = document.querySelector(`[data-pulse-id="${id}"]`) as HTMLElement | null
  if (el) registry.set(id, el.getBoundingClientRect())
}

export function refreshAll(): void {
  for (const id of registry.keys()) refreshPulseTarget(id)
}
