/* Shared APG radiogroup keyboard behavior (roving tabindex + arrows), the
   pattern Roles.astro already implements for its tablist. RTL-aware: physical
   arrow keys follow the visual direction. */

type KeyEventLike = {
  key: string;
  preventDefault(): void;
  currentTarget: EventTarget & HTMLElement;
};

export function handleRadioKey(e: KeyEventLike, count: number, index: number, select: (next: number) => void): void {
  const rtl = document.documentElement.dir === 'rtl';
  let next: number;
  switch (e.key) {
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
      return;
  }
  e.preventDefault();
  next = (next + count) % count;
  select(next);
  const group = e.currentTarget.closest<HTMLElement>('[role="radiogroup"]');
  requestAnimationFrame(() => {
    group?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  });
}
