import { useThrottle } from "@react-hook/throttle";
import React from "react";
import * as Y from "yjs";

type ObserveFunc = (event: Y.YEvent, transaction: Y.Transaction) => void;

export interface YObserve<DataT, YT> {
  readonly data: DataT;
  readonly event?: Y.YEvent;
  readonly type: YT;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useYObserve<YT extends Y.AbstractType<any>, DataT>(
  yType: YT,
  initial: DataT,
  serialize: () => DataT,
  fps = 30
): YObserve<DataT, YT> {
  const [details, setDetails] = useThrottle(
    { data: initial, event: undefined as Y.YEvent | undefined },
    fps
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

  return { ...details, type: yType };
}
