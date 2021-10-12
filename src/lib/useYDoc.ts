import React from "react";
import * as YProtocols from "y-protocols";
import * as Y from "yjs";

type Awareness = { data: AwarenessProtocol; changes: unknown[] };
type StopAwarenessFn = () => void;
export type StartAwarenessFn = (provider: typeof YProtocols) => StopAwarenessFn;
type UnmountFn = () => void;
type MountFn = (doc: Y.Doc, startAwareness: StartAwarenessFn) => UnmountFn;

export function useYDoc(
  name: string,
  mountFn: MountFn
): { awareness?: Awareness; doc: Y.Doc } {
  const [doc, setYDoc] = React.useState<{
    doc: Y.Doc;
    mountFn: MountFn;
    unmountFn: UnmountFn;
  }>();
  const [awareness, setAwareness] = React.useState<Awareness>();

  const yDoc = React.useMemo(() => {
    if (doc != null) return doc.doc;

    function mount(yd: Y.Doc, mFn: MountFn) {
      console.log("ROCKY: mount");
      setYDoc({
        doc: yd,
        mountFn: mFn,
        unmountFn: mFn(
          yd,
          startAwarenessFn((protocol, changes) => {
            setAwareness({ data: protocol.awareness, changes });
          })
        ),
      });
    }

    const d = new Y.Doc();
    d.guid = name;
    mount(d, mountFn);
    return d;
  }, [doc, mountFn, name]);

  React.useEffect(() => {
    function unmount() {
      if (doc == null) return;

      doc.unmountFn();
      setYDoc(undefined);
      setAwareness(undefined);
    }

    return () => unmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { awareness, doc: yDoc };
}

function startAwarenessFn(
  setAwareness: (provider: typeof YProtocols, changes: unknown[]) => void
) {
  return (provider: typeof YProtocols): StopAwarenessFn => {
    const { awareness } = provider;
    function updateAwareness() {
      setAwareness(provider, [...awareness.getStates().values()]);
    }

    updateAwareness();
    awareness.on("update", updateAwareness);
    return () => {
      awareness.off("update", updateAwareness);
    };
  };
}
