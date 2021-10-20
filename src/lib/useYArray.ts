import * as Y from "yjs";

import { useYObserve, YObserve } from "./useYObserve";

export function useYArray<T>(
  yDoc: Y.Doc,
  name?: string,
  fps = 30
): YObserve<T[], Y.Array<T>> {
  const yArr = yDoc.getArray<T>(name);
  return useYObserve<Y.Array<T>, T[]>(yArr, [], () => yArr.toArray(), fps);
}
