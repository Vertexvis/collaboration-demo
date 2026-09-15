import React from "react";

export function AlwaysScrollToBottom(): React.JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current == null) return;

    ref.current.scrollIntoView({ behavior: "smooth" });
  });

  return <div ref={ref} />;
}
