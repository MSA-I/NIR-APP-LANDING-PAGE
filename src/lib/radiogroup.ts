/* Shared APG radiogroup keyboard behavior (roving tabindex + arrows), the
   pattern Roles.astro already implements for its tablist. RTL-aware: physical
   arrow keys follow the visual direction. */

type KeyEventLike = {
  key: string;
  preventDefault(): void;
  currentTarget: EventTarget & HTMLElement;
};

/** APG arrow/Home/End resolution, RTL-aware. Returns null for other keys.
    Shared with the Roles tablist so both patterns move identically. */
export function arrowTarget(key: string, count: number, index: number): number | null {
  const rtl = document.documentElement.dir === 'rtl';
  let next: number;
  switch (key) {
    case 'ArrowRight':
      next = index + (rtl ? -1 : 1);
      break;
    case 'ArrowLeft':
      next = index + (rtl ? 1 : -1);
      break;
    case 'ArrowDown':
      next = index + 1;
      break;
    case 'ArrowUp':
      next = index - 1;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = count - 1;
      break;
    default:
      return null;
  }
  return (next + count) % count;
}

export function handleRadioKey(e: KeyEventLike, count: number, index: number, select: (next: number) => void): void {
  const next = arrowTarget(e.key, count, index);
  if (next === null) return;
  e.preventDefault();
  select(next);
  const group = e.currentTarget.closest<HTMLElement>('[role="radiogroup"]');
  requestAnimationFrame(() => {
    group?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  });
}
