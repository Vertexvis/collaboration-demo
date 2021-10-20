import * as Y from "yjs";

import { useYObserve, YObserve } from "./useYObserve";

type KeyT<T> = T[keyof T];

export function useYMap<T>(
  yDoc: Y.Doc,
  name?: string,
  fps = 30
): YObserve<T, Y.Map<KeyT<T>>> {
  const yMap = yDoc.getMap<KeyT<T>>(name);
  return useYObserve<Y.Map<KeyT<T>>, T>(
    yMap,
    {} as T,
    () => yMap.toJSON(),
    fps
  );
}
