import clsx from 'clsx';

export function getMenuPositionClassName(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const isBottomOverflow = rect.bottom > window.innerHeight && rect.top > rect.height;
  const isLeftOverflow = rect.left < 0;
  const isRightOverflow = rect.right > window.innerWidth;
  const isTopOverflow = rect.top < 0;

  const className = clsx({
    'rnd__menu--top': isBottomOverflow,
    'rnd__menu--bottom': isTopOverflow,
    'rnd__menu--right': isLeftOverflow,
    'rnd__menu--left': isRightOverflow,
  });

  return className;
}
