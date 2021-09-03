import type { Environment } from "@vertexvis/viewer";
import equal from "fast-deep-equal/es6/react";
import React from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { DefaultCredentials } from "../lib/config";
import { selectByItemId, updateCamera } from "../lib/scene-items";
import { useViewer } from "../lib/viewer";
import { Header } from "./Header";
import { JoinDialog } from "./JoinDialog";
import { Layout, RightDrawerWidth } from "./Layout";
import { Awareness, RightDrawer, UserData } from "./RightDrawer";
import { Viewer } from "./Viewer";

export interface Props {
  readonly vertexEnv: Environment;
}

// interface UndoEvent {
//   stackItem: { meta: Map<any, any> };
//   type: "undo" | "redo";
// }

export function Home({ vertexEnv }: Props): JSX.Element {
  const viewer = useViewer();
  const provider = React.useRef<WebrtcProvider>();
  const doc = React.useRef(new Y.Doc());
  const yCamera = React.useRef(doc.current.getMap("camera"));
  const ySelection = React.useRef(doc.current.getMap("selection"));
  // const undoSelection = React.useRef(new Y.UndoManager(ySelection.current));

  const [userData, setUserData] = React.useState<UserData>();
  const [dialogOpen, setDialogOpen] = React.useState(!userData);
  const [initialized, setInitialized] = React.useState(false);
  const [cameraController, setCameraController] = React.useState<string>();
  const [clientId, setClientId] = React.useState<number>();
  const [awareness, setAwareness] = React.useState<Record<number, Awareness>>(
    {}
  );

  React.useEffect(() => {
    if (userData && !initialized && !provider.current?.connected) {
      setInitialized(true);
      provider.current = new WebrtcProvider("vertex-demo", doc.current);

      const cId = provider.current?.awareness.clientID;
      const localA: Awareness = {
        user: {
          clientId: cId,
          color: userData.color,
          name: userData.name,
        },
      };
      provider.current.awareness.setLocalStateField("user", localA.user);
      setClientId(localA.user.clientId);
      setAwareness({ ...awareness, [localA.user.clientId]: localA });

      // undoSelection.current.on("stack-item-added", (e: UndoEvent) => {
      //   e.stackItem.meta.set(
      //     "deselectItem",
      //     ySelection.current.get(cId.toString())?.itemId
      //   );
      // });

      // undoSelection.current.on("stack-item-popped", (e: UndoEvent) => {
      //   selectByItemId({
      //     deselectItemId: e.stackItem.meta.get("deselectItem"),
      //     viewer: viewer.ref.current,
      //   });
      // });

      provider.current.awareness.on("change", () => {
        const states = provider.current?.awareness.getStates().entries();
        if (states) {
          const a: Record<number, Awareness> = {};
          [...states]
            .filter(([, v]) => v.user != null)
            .forEach(([k, v]) => {
              a[k] = v as Awareness;
            });
          setAwareness(a);
        }
      });

      yCamera.current.observe(() => {
        const cc = yCamera.current.get("cameraController");
        setCameraController(cc);
        if (cc !== provider.current?.awareness.clientID) {
          console.log("Calling updateCamera");
          updateCamera({
            camera: yCamera.current.get("camera"),
            viewer: viewer.ref.current,
          });
        }
      });

      ySelection.current.observe((e) => {
        e.keysChanged.forEach((k) => {
          const s = provider.current?.awareness.states.get(parseInt(k, 10));
          const sel = ySelection.current?.get(k);
          if (s == null || sel == null) return;

          console.log(`ySelection by '${s.user.name}', ${JSON.stringify(sel)}`);
          selectByItemId({
            color: s.user.color,
            deselectItemId: sel.oldItemId,
            itemId: sel.itemId,
            viewer: viewer.ref.current,
          });
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awareness, cameraController, initialized, userData]);
  /*
    TODO:
    - Move color to NameDialog
    - Broadcast state
    - Save state prior to broadcast/host
    - Camera as undo meta
    - Button to share pointer
    - Snapshot versioning
    - Add to yjs docs
  */
  return (
    <Layout
      header={<Header onOpenSceneClick={() => setDialogOpen(true)} />}
      main={
        viewer.isReady && (
          <Viewer
            configEnv={vertexEnv}
            credentials={DefaultCredentials}
            onFrameDrawn={(e) => {
              const { lookAt, position, up } = e.detail.scene.camera;
              const cam = { lookAt, position, up };
              if (
                cameraController === provider.current?.awareness.clientID &&
                !equal(cam, yCamera.current.get("camera"))
              ) {
                console.log("Updating yCamera");
                yCamera.current.set("camera", cam);
              }
            }}
            onSelect={(hit) => {
              console.debug({
                hitNormal: hit?.hitNormal,
                hitPoint: hit?.hitPoint,
                sceneItemId: hit?.itemId?.hex,
                sceneItemSuppliedId: hit?.itemSuppliedId?.value,
              });
              if (clientId == null) return;

              const cId = clientId.toString();
              const sel = ySelection.current.get(cId);
              if (sel?.itemId != hit?.itemId?.hex) {
                ySelection.current.set(cId, {
                  itemId: hit?.itemId?.hex,
                  oldItemId: ySelection.current.get(cId)?.itemId,
                });
              }
            }}
            // undoSelection={undoSelection}
            viewer={viewer.ref}
          />
        )
      }
      rightDrawer={
        <RightDrawer
          cameraController={cameraController ?? undefined}
          clientId={clientId?.toString()}
          onCameraController={(control) =>
            yCamera.current.set(
              "cameraController",
              control ? provider.current?.awareness.clientID : null
            )
          }
          open
          awareness={awareness}
        />
      }
      rightDrawerWidth={RightDrawerWidth}
    >
      {dialogOpen && (
        <JoinDialog
          onSave={(n: string, c: string) => {
            setUserData({ color: c, name: n });
            setDialogOpen(false);
          }}
          open={dialogOpen}
        />
      )}
    </Layout>
  );
}
