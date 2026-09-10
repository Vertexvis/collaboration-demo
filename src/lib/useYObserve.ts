import { useThrottle } from "@react-hook/throttle";
import React from "react";
import * as Y from "yjs";

// Yjs makes AbstractType invariant in its concrete observer event type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YType = Y.AbstractType<any>;

type ObserveFunc<YT extends YType> = (
  event: Y.YEvent<YT>,
  transaction: Y.Transaction
) => void;

export interface YObserve<DataT, YT extends YType> {
  readonly data: DataT;
  readonly event?: Y.YEvent<YT>;
  readonly type: YT;
}

export function useYObserve<YT extends YType, DataT>(
  yType: YT,
  initial: DataT,
  serialize: () => DataT,
  fps = 30
): YObserve<DataT, YT> {
  const [details, setDetails] = useThrottle(
    { data: initial, event: undefined as Y.YEvent<YT> | undefined },
    fps
  );
  const [observer, setObserver] = React.useState<ObserveFunc<YT>>();

  function update(e: Y.YEvent<YT>) {
    setDetails({ data: serialize(), event: e });
  }

  function listen(listenFn: ObserveFunc<YT>) {
    yType.observe(listenFn);
    setObserver(listenFn);
  }

  React.useEffect(() => {
    function unListen(type: YT) {
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
