import { useThrottle } from "@react-hook/throttle";
import React from "react";
import * as Y from "yjs";

type ObserveFunc = (event: Y.YEvent, transaction: Y.Transaction) => void;

export interface YObserve<T> {
  readonly data: T;
  readonly event?: Y.YEvent;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useYObserve<T extends Y.AbstractType<any>, DataT>(
  yType: T,
  initial: DataT,
  serialize: () => DataT
): YObserve<DataT> {
  const [details, setDetails] = useThrottle(
    { data: initial, event: undefined as Y.YEvent | undefined },
    15
  );
  const [observer, setObserver] = React.useState<ObserveFunc>();

  function update(e: Y.YEvent) {
    setDetails({ data: serialize(), event: e });
  }

  function listen(listenFn: ObserveFunc) {
    yType.observe(listenFn);
    setObserver(listenFn);
  }

  React.useEffect(() => {
    function unListen(type: Y.AbstractType<Y.YEvent>) {
      if (observer == null) return;

      type.unobserve(observer);
      setDetails({ data: initial, event: undefined });
      setObserver(undefined);
    }

    listen((e) => update(e));

    return () => unListen(yType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return details;
}
