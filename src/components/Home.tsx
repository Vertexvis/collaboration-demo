import { Environment, Viewport } from "@vertexvis/viewer";
import equal from "fast-deep-equal/es6/react";
import { useRouter } from "next/router";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { DefaultCredentials, head, StreamCredentials } from "../lib/config";
import { selectByItemId, updateCamera } from "../lib/scene-items";
import { useViewer } from "../lib/viewer";
import { Header } from "./Header";
import { JoinDialog } from "./JoinDialog";
import { Layout, RightDrawerWidth } from "./Layout";
import { OpenDialog } from "./OpenScene";
import { Awareness, RightDrawer, UserData } from "./RightDrawer";
import { Viewer } from "./Viewer";
import { Pin } from "./ViewerSpeedDial";

export interface Props {
  readonly vertexEnv: Environment;
}

interface State {
  selectItemId?: string;
  pins: Pin[];
}

type Model = Record<string, State>;

const CameraKey = "camera";
const CameraControllerKey = "cameraController";
const CredentialsKey = "credentials";

export function Home({ vertexEnv }: Props): JSX.Element {
  const router = useRouter();
  const viewer = useViewer();
  const [credentials, setCredentials] =
    React.useState<StreamCredentials>(DefaultCredentials);
  const provider = React.useRef<WebrtcProvider>();
  const yDoc = React.useRef(new Y.Doc());
  const yConfig = React.useRef(yDoc.current.getMap("config"));
  const yModel = React.useRef(yDoc.current.getMap("model"));
  const undoManager = React.useRef(new Y.UndoManager(yModel.current));

  const [liveSession, setLiveSession] = React.useState<string>();
  const [userData, setUserData] = React.useState<UserData>();
  const [openSceneDialogOpen, setOpenSceneDialogOpen] = React.useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = React.useState(
    !userData || !liveSession
  );
  const [initialized, setInitialized] = React.useState(false);
  const [cameraController, setCameraController] = React.useState<string>();
  const [clientId, setClientId] = React.useState<number>();
  const [awareness, setAwareness] = React.useState<Record<number, Awareness>>(
    {}
  );
  const [pinsEnabled, setPinsEnabled] = React.useState(false);
  const [model, setModel] = React.useState<Model>({});
  const prevAwareness = usePrevious<Record<number, Awareness>>(awareness);

  React.useEffect(() => {
    if (!router.isReady) return;

    setLiveSession(head(router.query.session));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  React.useEffect(() => {
    if (!liveSession) return;

    router.push(`/?session=${encodeURIComponent(liveSession)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSession]);

  useHotkeys("o", () => setOpenSceneDialogOpen(true), { keyup: true });

  React.useEffect(() => {
    if (prevAwareness == null) return;

    const removed = Object.keys(prevAwareness).filter(
      (pk) => !Object.keys(awareness).some((k) => pk === k)
    );
    if (removed.length === 0) return;

    const newModel = JSON.parse(JSON.stringify(model));
    Promise.all(
      removed.map((r) => {
        const cc = yConfig.current.get(CameraControllerKey);
        if (cc === r) yConfig.current.set(CameraControllerKey, null);

        if (!newModel[r]) return;
        const deselectItemId = model[r].selectItemId;
        delete newModel[r];
        return selectByItemId({ deselectItemId, viewer: viewer.ref.current });
      })
    );
    setModel(newModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awareness, model]);

  React.useEffect(() => {
    if (
      !liveSession ||
      !userData ||
      initialized ||
      provider.current?.connected
    ) {
      return;
    }

    setInitialized(true);
    provider.current = new WebrtcProvider(liveSession, yDoc.current);

    const cId = provider.current?.awareness.clientID;
    const localA: Awareness = { user: { ...userData, clientId: cId } };
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

    yConfig.current.observe((e) => {
      e.changes.keys.forEach(({ action, oldValue }, key) => {
        const cur = yConfig.current.get(key);
        console.debug(
          `${action}, new=${JSON.stringify(cur)}, old=${JSON.stringify(
            oldValue
          )}`
        );
        switch (key) {
          case CameraKey:
            if (
              yConfig.current.get(CameraControllerKey) !==
              provider.current?.awareness.clientID
            ) {
              updateCamera({ camera: cur, viewer: viewer.ref.current });
            }
            break;
          case CameraControllerKey:
            setCameraController(cur);
            break;
          case CredentialsKey:
            setCredentials(cur);
            break;
          default:
            console.warn(`Unknown key: ${key}`);
            break;
        }
      });
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
            deselectItemId: oldValue?.selectItemId,
            viewer: viewer.ref.current,
          });
        }
      });
      const newModel: Model = {};
      yModel.current.forEach((v: State, k: string) => {
        const a = getAwareness(k, provider.current);
        newModel[k] = a
          ? {
              ...v,
              pins: v.pins
                ? v.pins.map((p) => ({ ...p, color: a.user.color }))
                : [],
            }
          : { pins: [] };
      });
      setModel(newModel);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awareness, initialized, liveSession, userData]);

  return router.isReady ? (
    <Layout
      header={
        <Header
          liveSession={liveSession}
          onOpenSceneClick={() => setOpenSceneDialogOpen(true)}
        />
      }
      main={
        viewer.isReady && (
          <Viewer
            configEnv={vertexEnv}
            credentials={credentials}
            onFrameDrawn={(e) => {
              const { lookAt, position, up } = e.detail.scene.camera;
              const cam = { lookAt, position, up };
              if (
                cameraController === provider.current?.awareness.clientID &&
                !equal(cam, yConfig.current.get(CameraKey))
              ) {
                yConfig.current.set(CameraKey, cam);
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
            pins={Object.keys(model)
              .map((k) => model[k].pins)
              .filter((k) => k != null)
              .flat()}
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
            yConfig.current.set(
              CameraControllerKey,
              control ? provider.current?.awareness.clientID : null
            )
          }
          open
          awareness={awareness}
        />
      }
      rightDrawerWidth={RightDrawerWidth}
    >
      {joinDialogOpen && (
        <JoinDialog
          liveSession={liveSession}
          onJoin={(mn: string, n: string, c: string) => {
            setLiveSession(mn);
            setUserData({ color: c, name: n });
            setJoinDialogOpen(false);
          }}
          open={joinDialogOpen}
        />
      )}
      {openSceneDialogOpen && (
        <OpenDialog
          credentials={credentials}
          onClose={() => setOpenSceneDialogOpen(false)}
          onConfirm={(cs) => {
            yConfig.current?.set(CredentialsKey, cs);
            yModel.current.clear();
            setOpenSceneDialogOpen(false);
          }}
          open={openSceneDialogOpen}
        />
      )}
    </Layout>
  ) : (
    <></>
  );
}

function getAwareness(
  key: string,
  provider?: WebrtcProvider
): Awareness | undefined {
  return provider?.awareness.states.get(parseInt(key, 10)) as Awareness;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
