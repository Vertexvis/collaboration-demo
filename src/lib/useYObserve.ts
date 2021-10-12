import { useThrottle } from "@react-hook/throttle";
import React from "react";
import * as Y from "yjs";

type ObserveFunc = (event: Y.YEvent, transaction: Y.Transaction) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = any;

export function useYObserve<T extends Y.AbstractType<Data>>(
  yType: T,
  toJSON: () => Data
): Data {
  const [details, setDetails] = useThrottle(
    { data: undefined as Data, event: undefined as Y.YEvent | undefined },
    15
  );
  const [observer, setObserver] = React.useState<ObserveFunc>();

  function update(e: Y.YEvent, d: Data) {
    setDetails({ data: d, event: e });
  }

  function listen(type: Y.AbstractType<Data>, listenFn: ObserveFunc) {
    type.observe(listenFn);
    setObserver(listenFn);
  }

  React.useEffect(() => {
    function unListen(type: Y.AbstractType<Data>) {
      if (observer == null) return;

      type.unobserve(observer);
      setDetails({ data: undefined, event: undefined });
      setObserver(undefined);
    }

    listen(yType, (e) => update(e, toJSON()));

    return () => unListen(yType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return details;
}
