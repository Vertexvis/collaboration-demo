import React from "react";

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = React.useState<boolean>(false);

  React.useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      if (key === targetKey) setKeyPressed(true);
    }

    function upHandler({ key }: KeyboardEvent) {
      if (key === targetKey) setKeyPressed(false);
    }

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}
