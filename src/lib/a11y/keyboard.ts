// Keyboard accessibility utilities

export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Handle keyboard activation (Enter or Space)
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === KEYS.ENTER || event.key === KEYS.SPACE;
}

// Create keyboard handler for click-like actions
export function createKeyboardHandler(
  callback: () => void
): (event: React.KeyboardEvent) => void {
  return (event: React.KeyboardEvent) => {
    if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) {
      event.preventDefault();
      callback();
    }
  };
}

// Roving tabindex management
export function getRovingTabIndex(
  items: HTMLElement[],
  currentIndex: number
): number[] {
  return items.map((_, i) => (i === currentIndex ? 0 : -1));
}

// Focus next/previous item in a list
export function focusNext(
  items: HTMLElement[],
  currentIndex: number,
  wrap: boolean = true
): number {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= items.length) {
    return wrap ? 0 : currentIndex;
  }
  items[nextIndex]?.focus();
  return nextIndex;
}

export function focusPrevious(
  items: HTMLElement[],
  currentIndex: number,
  wrap: boolean = true
): number {
  const prevIndex = currentIndex - 1;
  if (prevIndex < 0) {
    return wrap ? items.length - 1 : currentIndex;
  }
  items[prevIndex]?.focus();
  return prevIndex;
}

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
}

// Trap focus within a container
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== KEYS.TAB) return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => container.removeEventListener('keydown', handleKeyDown);
}
