import * as Y from "yjs";

import { useYObserve } from "./useYObserve";
import { unimplemented } from "./utils";

type ArrayFunctions<T> = Pick<
  Y.Array<T>,
  "forEach" | "map" | "slice" | "get" | "delete" | "unshift" | "push" | "insert"
>;
type ArrayWrapper<T> = { data: T[]; event?: Y.YEvent } & ArrayFunctions<T>;

export function useYArray<T>(yArr: Y.Array<T>): ArrayWrapper<T> {
  const observer = useYObserve<Y.Array<T>>(yArr, () => yArr.toArray());

  function thrw(funcKey: keyof Y.Array<T>) {
    return unimplemented<Y.Array<T>>("Y.Array", funcKey);
  }

  return {
    forEach: yArr.forEach ? yArr.forEach.bind(yArr) : thrw("forEach"),
    map: yArr.map ? yArr.map.bind(yArr) : thrw("map"),
    slice: yArr.slice ? yArr.slice.bind(yArr) : thrw("slice"),
    get: yArr.get ? yArr.get.bind(yArr) : thrw("get"),
    delete: yArr.delete ? yArr.delete.bind(yArr) : thrw("delete"),
    unshift: yArr.unshift ? yArr.unshift.bind(yArr) : thrw("unshift"),
    push: yArr.push ? yArr.push.bind(yArr) : thrw("push"),
    insert: yArr.insert ? yArr.insert.bind(yArr) : thrw("insert"),
    data: observer.data ?? [],
    event: observer.event,
  };
}
