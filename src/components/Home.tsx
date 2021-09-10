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

export function Home({ vertexEnv }: Props): JSX.Element {
  const viewer = useViewer();
  const provider = React.useRef<WebrtcProvider>();
  const yDoc = React.useRef(new Y.Doc());
  const yCamera = React.useRef(yDoc.current.getMap("camera"));
  const ySelection = React.useRef(yDoc.current.getMap("selection"));
  const undoSelection = React.useRef(new Y.UndoManager(ySelection.current));

  const [meetingName, setMeetingName] = React.useState<string>();
  const [userData, setUserData] = React.useState<UserData>();
  const [dialogOpen, setDialogOpen] = React.useState(!userData);
  const [initialized, setInitialized] = React.useState(false);
  const [cameraController, setCameraController] = React.useState<string>();
  const [clientId, setClientId] = React.useState<number>();
  const [awareness, setAwareness] = React.useState<Record<number, Awareness>>(
    {}
  );

  React.useEffect(() => {
    if (
      meetingName &&
      userData &&
      !initialized &&
      !provider.current?.connected
    ) {
      setInitialized(true);
      provider.current = new WebrtcProvider(meetingName, yDoc.current);

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
          updateCamera({
            camera: yCamera.current.get("camera"),
            viewer: viewer.ref.current,
          });
        }
      });

      ySelection.current.observe((e) => {
        e.changes.keys.forEach(({ action, oldValue }, key) => {
          const a = provider.current?.awareness.states.get(parseInt(key, 10));
          const sel = ySelection.current.get(key);
          if (a == null) return;

          const color = a.user.color;
          console.log(
            `${a.user.name} ${action}, new=${JSON.stringify(
              sel
            )}, old=${JSON.stringify(oldValue)}`
          );
          if (action === "add") {
            selectByItemId({
              color,
              selectItemId: sel?.selectItemId,
              viewer: viewer.ref.current,
            });
          } else if (action === "update") {
            selectByItemId({
              color,
              selectItemId: sel?.selectItemId,
              deselectItemId: oldValue?.selectItemId,
              viewer: viewer.ref.current,
            });
          } else if (action === "delete") {
            selectByItemId({
              color,
              deselectItemId: oldValue?.selectItemId,
              viewer: viewer.ref.current,
            });
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awareness, cameraController, initialized, meetingName, userData]);

  return (
    <Layout
      header={<Header meetingName={meetingName} />}
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
                yCamera.current.set("camera", cam);
              }
            }}
            onSelect={(hit) => {
              const sceneItemId = hit?.itemId?.hex;
              console.debug({
                hitNormal: hit?.hitNormal,
                hitPoint: hit?.hitPoint,
                sceneItemId,
                sceneItemSuppliedId: hit?.itemSuppliedId?.value,
              });
              if (clientId == null) return;

              const cId = clientId.toString();
              if (ySelection.current.get(cId)?.selectItemId != sceneItemId) {
                ySelection.current.set(cId, { selectItemId: sceneItemId });
              }
            }}
            undoSelection={undoSelection}
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
          onSave={(mn: string, n: string, c: string) => {
            setMeetingName(mn);
            setUserData({ color: c, name: n });
            setDialogOpen(false);
          }}
          open={dialogOpen}
        />
      )}
    </Layout>
  );
}
