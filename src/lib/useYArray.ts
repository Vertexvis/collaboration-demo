import * as Y from "yjs";

import { useYObserve, YObserve } from "./useYObserve";

export function useYArray<T>(yArr: Y.Array<T>): YObserve<T[]> {
  return useYObserve<Y.Array<T>, T[]>(yArr, [], () => yArr.toArray());
}
