import { Environment, Viewport } from "@vertexvis/viewer";
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
import { Pin, PinColor } from "./ViewerSpeedDial";

export interface Props {
  readonly vertexEnv: Environment;
}

export function Home({ vertexEnv }: Props): JSX.Element {
  const viewer = useViewer();
  const provider = React.useRef<WebrtcProvider>();
  const yDoc = React.useRef(new Y.Doc());
  const yCamera = React.useRef(yDoc.current.getMap("camera"));
  const yModel = React.useRef(yDoc.current.getMap("model"));
  const undoManager = React.useRef(new Y.UndoManager(yModel.current));

  const [meetingName, setMeetingName] = React.useState<string>();
  const [userData, setUserData] = React.useState<UserData>();
  const [dialogOpen, setDialogOpen] = React.useState(!userData);
  const [initialized, setInitialized] = React.useState(false);
  const [cameraController, setCameraController] = React.useState<string>();
  const [clientId, setClientId] = React.useState<number>();
  const [awareness, setAwareness] = React.useState<Record<number, Awareness>>(
    {}
  );
  const [pinsEnabled, setPinsEnabled] = React.useState(false);
  const [pins, setPins] = React.useState<Pin[]>([]);

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

      yModel.current.observe((e) => {
        e.changes.keys.forEach(({ action, oldValue }, key) => {
          const a = getAwareness(key, provider.current);
          const cur = yModel.current.get(key);
          if (a == null) return;

          const color = a.user.color;
          console.debug(
            `${a.user.name} ${action}, new=${JSON.stringify(
              cur
            )}, old=${JSON.stringify(oldValue)}`
          );
          if (action === "add") {
            selectByItemId({
              color,
              selectItemId: cur?.selectItemId,
              viewer: viewer.ref.current,
            });
          } else if (action === "update") {
            selectByItemId({
              color,
              selectItemId: cur?.selectItemId,
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
        let ps: Pin[] = [];
        yModel.current.forEach(
          (v: { pins: Pin[] }, k: string) =>
            (ps = v.pins
              ? ps.concat(
                  v.pins.map((p: Pin) => ({
                    ...p,
                    color:
                      getAwareness(k, provider.current)?.user.color ??
                      PinColor.enabled,
                  }))
                )
              : ps)
        );
        setPins(ps);
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
            onSelect={async ({ detail: { buttons, position }, hit }) => {
              const itemId = hit?.itemId?.hex;
              console.debug({
                hitNormal: hit?.hitNormal,
                hitPoint: hit?.hitPoint,
                sceneItemId: itemId,
                sceneItemSuppliedId: hit?.itemSuppliedId?.value,
              });
              if (clientId == null) return;

              const cId = clientId.toString();
              const cur = yModel.current.get(cId);
              if (pinsEnabled) {
                if (
                  itemId != null &&
                  buttons !== 2 &&
                  position != null &&
                  viewer.ref.current?.frame?.dimensions != null
                ) {
                  const db = await viewer.ref.current?.frame?.depthBuffer();
                  if (db != null) {
                    const rect = viewer.ref.current?.getBoundingClientRect();
                    const worldPosition = new Viewport(
                      rect.width,
                      rect.height
                    ).transformPointToWorldSpace(position, db);
                    yModel.current.set(cId, {
                      ...cur,
                      pins: [...(cur?.pins ?? []), { worldPosition, itemId }],
                    });
                  }
                }
              } else {
                if (yModel.current.get(cId)?.selectItemId != itemId) {
                  yModel.current.set(cId, { ...cur, selectItemId: itemId });
                }
              }
            }}
            pins={pins}
            pinTool={{
              enabled: pinsEnabled,
              onClick: () => setPinsEnabled(!pinsEnabled),
            }}
            undoManager={undoManager}
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
          onJoin={(mn: string, n: string, c: string) => {
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

function getAwareness(
  key: string,
  provider?: WebrtcProvider
): Awareness | undefined {
  return provider?.awareness.states.get(parseInt(key, 10)) as Awareness;
}
