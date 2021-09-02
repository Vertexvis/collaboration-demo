import React from "react";

interface MousePosition {
  x: number | null;
  y: number | null;
}

export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = React.useState<MousePosition>({
    x: null,
    y: null,
  });

  const updateMousePosition = (ev: { clientX: number; clientY: number }) => {
    setMousePosition({ x: ev.clientX, y: ev.clientY });
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
}
