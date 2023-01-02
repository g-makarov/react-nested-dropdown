import { RefObject, useEffect, useRef } from 'react';

const defaultEvents = ['mousedown', 'touchstart'];

export function useClickAway(
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: Event) => void,
  events: string[] = defaultEvents,
): void {
  const savedCallback = useRef(onClickAway);

  useEffect(() => {
    savedCallback.current = onClickAway;
  }, [onClickAway]);

  useEffect(() => {
    function handler(event: Event): void {
      const { current: el } = ref;
      if (el && !el.contains(event.target as Node)) {
        savedCallback.current(event);
      }
    }

    events.forEach(eventName => {
      document.addEventListener(eventName, handler);
    });

    return () => {
      events.forEach(eventName => {
        document.removeEventListener(eventName, handler);
      });
    };
  }, [events, ref]);
}
