import * as Y from "yjs";

import { useYObserve } from "./useYObserve";
import { unimplemented } from "./utils";

type MapFunctions<T> = Pick<
  Y.Map<T>,
  "set" | "get" | "has" | "delete" | "forEach" | "entries" | "values" | "keys"
>;
type MapWrapper<T, U extends Record<string, T>> = {
  data: U;
  event?: Y.YEvent;
} & MapFunctions<T>;

export function useYMap<T, U extends Record<string, T>>(
  yMap: Y.Map<T>
): MapWrapper<T, U> {
  const observer = useYObserve<Y.Map<T>>(yMap, () => yMap.toJSON());

  function thrw(funcKey: keyof Y.Map<T>) {
    return unimplemented<Y.Map<T>>("Y.Map", funcKey);
  }

  return {
    keys: yMap.keys ? yMap.keys.bind(yMap) : thrw("keys"),
    values: yMap.values ? yMap.values.bind(yMap) : thrw("values"),
    entries: yMap.entries ? yMap.entries.bind(yMap) : thrw("entries"),
    forEach: yMap.forEach ? yMap.forEach.bind(yMap) : thrw("forEach"),
    delete: yMap.delete ? yMap.delete.bind(yMap) : thrw("delete"),
    set: yMap.set ? yMap.set.bind(yMap) : thrw("set"),
    get: yMap.get ? yMap.get.bind(yMap) : thrw("get"),
    has: yMap.has ? yMap.has.bind(yMap) : thrw("has"),
    data: observer.data ?? {},
    event: observer.event,
  };
}
