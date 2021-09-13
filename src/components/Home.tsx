import { Environment, Viewport } from "@vertexvis/viewer";
import equal from "fast-deep-equal/es6/react";
import { useRouter } from "next/router";
import React from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { DefaultCredentials, head } from "../lib/config";
import { selectByItemId, updateCamera } from "../lib/scene-items";
import { useViewer } from "../lib/viewer";
import { Header } from "./Header";
import { JoinDialog } from "./JoinDialog";
import { Layout, RightDrawerWidth } from "./Layout";
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

export function Home({ vertexEnv }: Props): JSX.Element {
  const router = useRouter();
  const viewer = useViewer();
  const provider = React.useRef<WebrtcProvider>();
  const yDoc = React.useRef(new Y.Doc());
  const yCamera = React.useRef(yDoc.current.getMap("camera"));
  const yModel = React.useRef(yDoc.current.getMap("model"));
  const undoManager = React.useRef(new Y.UndoManager(yModel.current));

  const [meeting, setMeeting] = React.useState<string>();
  const [userData, setUserData] = React.useState<UserData>();
  const [dialogOpen, setDialogOpen] = React.useState(!userData || !meeting);
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

    setMeeting(head(router.query.meeting));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  React.useEffect(() => {
    if (!meeting) return;

    router.push(`/?meeting=${encodeURIComponent(meeting)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting]);

  React.useEffect(() => {
    if (prevAwareness == null) return;

    const removed = Object.keys(prevAwareness).filter(
      (pk) => !Object.keys(awareness).some((k) => pk === k)
    );
    if (removed.length === 0) return;

    const newModel = JSON.parse(JSON.stringify(model));
    Promise.all(
      removed.map((r) => {
        if (!newModel[r]) return;

        selectByItemId({
          deselectItemId: model[r].selectItemId,
          viewer: viewer.ref.current,
        });
        delete newModel[r];
      })
    );
    setModel(newModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awareness, model]);

  React.useEffect(() => {
    if (!meeting || !userData || initialized || provider.current?.connected) {
      return;
    }

    setInitialized(true);
    provider.current = new WebrtcProvider(meeting, yDoc.current);

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
  }, [awareness, initialized, meeting, userData]);

  return router.isReady ? (
    <Layout
      header={<Header meeting={meeting} />}
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
          meeting={meeting}
          onJoin={(mn: string, n: string, c: string) => {
            setMeeting(mn);
            setUserData({ color: c, name: n });
            setDialogOpen(false);
          }}
          open={dialogOpen}
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
