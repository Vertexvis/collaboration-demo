import React from "react";

export function AlwaysScrollToBottom(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = React.useRef<any>();

  React.useEffect(() => {
    if (ref.current == null) return;

    ref.current.scrollIntoView({ behavior: "smooth" });
  });

  return <div ref={ref} />;
}
