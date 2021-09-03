import React from "react";

export function useEventListener(
  eventName: string,
  handler: (e: Event) => void
): void {
  const savedHandler = React.useRef<(e: Event) => void>();

  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(() => {
    if (!window || !window.addEventListener) return;

    function eventListener(e: Event) {
      if (!savedHandler.current) return;

      return savedHandler.current(e);
    }

    window.addEventListener(eventName, eventListener);
    return () => {
      window.removeEventListener(eventName, eventListener);
    };
  }, [eventName]);
}
