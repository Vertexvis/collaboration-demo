import * as Y from "yjs";

import { useYObserve, YObserve } from "./useYObserve";

export function useYMap<T>(yMap: Y.Map<T[keyof T]>): YObserve<T> {
  return useYObserve<Y.Map<T[keyof T]>, T>(yMap, {} as T, () => yMap.toJSON());
}
