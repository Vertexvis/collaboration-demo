import { Box, Menu, MenuItem } from "@mui/material";
import useMousePosition from "@react-hook/mouse-position";
import { Environment, Viewport } from "@vertexvis/viewer";
import { FrameCamera } from "@vertexvis/viewer/dist/types/lib/types/frameCamera";
import equal from "fast-deep-equal/es6/react";
import { useRouter } from "next/router";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { DefaultCredentials, head, StreamCredentials } from "../lib/config";
import {
  hideByItemId,
  selectByItemId,
  showAll,
  updateCamera,
} from "../lib/scene-items";
import {
  Awareness,
  ContextData,
  Message,
  Model,
  State,
  UserData,
} from "../lib/state";
import { usePrevious } from "../lib/usePrevious";
import { useYArray } from "../lib/useYArray";
import { useYMap } from "../lib/useYMap";
import { useViewer } from "../lib/viewer";
import { Cursor } from "./Cursor";
import { Header } from "./Header";
import { JoinDialog } from "./JoinDialog";
import { Layout, RightDrawerWidth } from "./Layout";
import { OpenDialog } from "./OpenScene";
import { RightDrawer } from "./RightDrawer";
import { Hit, Viewer } from "./Viewer";

export interface Props {
  readonly vertexEnv: Environment;
}

const Keys = {
  camera: "camera",
  cameraController: "cameraController",
  chat: "chat",
  config: "config",
  credentials: "credentials",
  model: "model",
  mousePosition: "mousePosition",
};

const DefaultContextData: ContextData = {
  itemId: undefined,
  selectOccurred: false,
  point: undefined,
};

export function Home({ vertexEnv }: Props): JSX.Element {
  const router = useRouter();
  const viewer = useViewer();

  const mouseRef = React.useRef<HTMLDivElement>(null);
  const provider = React.useRef<WebrtcProvider>();
  const yDoc = React.useRef(new Y.Doc());
  const yModel = React.useRef(yDoc.current.getMap(Keys.model));
  const { data: config, set: configSetter } = useYMap<
    number | Partial<FrameCamera> | undefined | StreamCredentials,
    {
      camera: Partial<FrameCamera>;
      cameraController: number;
      credentials: StreamCredentials;
    }
  >(yDoc.current.getMap(Keys.config));
  const { data: messages, push: pushMessages } = useYArray<Message>(
    yDoc.current.getArray<Message>(Keys.chat)
  );
  const undoManager = React.useRef(new Y.UndoManager(yModel.current));

  const [liveSession, setLiveSession] = React.useState<string>();
  const [userData, setUserData] = React.useState<UserData>();
  const [openSceneDialogOpen, setOpenSceneDialogOpen] = React.useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = React.useState(
    !userData || !liveSession
  );
  const [initialized, setInitialized] = React.useState(false);
  const [clientId, setClientId] = React.useState<number>();
  const [contextData, setContextData] =
    React.useState<ContextData>(DefaultContextData);
  const [awareness, setAwareness] = React.useState<Record<number, Awareness>>(
    {}
  );
  const [pinsEnabled, setPinsEnabled] = React.useState(false);
  const [model, setModel] = React.useState<Model>({});
  const prevAwareness = usePrevious<Record<number, Awareness>>(awareness);
  const [sceneReady, setSceneReady] = React.useState(false);

  const mousePosition = useMousePosition(mouseRef, {
    enterDelay: 100,
    fps: 15,
    leaveDelay: 100,
  });
  useHotkeys("o", () => setOpenSceneDialogOpen(true), { keyup: true });

  React.useEffect(() => {
    if (provider.current == null || !config.cameraController) return;

    provider.current.awareness.setLocalStateField(
      Keys.mousePosition,
      mousePosition
    );
  }, [config.cameraController, mousePosition]);

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

  React.useEffect(() => {
    if (prevAwareness == null) return;

    const removed = Object.keys(prevAwareness).filter(
      (pk) => !Object.keys(awareness).some((k) => pk === k)
    );
    if (removed.length === 0) return;

    const newModel = JSON.parse(JSON.stringify(model));
    Promise.all(
      removed.map((r) => {
        if (config.cameraController === parseInt(r, 10)) {
          configSetter(Keys.cameraController, undefined);
        }

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
    if (config == null) return;

    if (config.cameraController !== provider.current?.awareness.clientID) {
      updateCamera({ camera: config.camera, viewer: viewer.ref.current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  React.useEffect(() => {
    if (
      !sceneReady ||
      !liveSession ||
      !userData ||
      initialized ||
      provider.current?.connected
    ) {
      return;
    }

    setInitialized(true);
    provider.current = new WebrtcProvider(liveSession, yDoc.current);
    provider.current.signalingUrls = [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling-us.herokuapp.com",
    ];

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
  }, [awareness, initialized, liveSession, sceneReady, userData]);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();

    setContextData(
      contextData.point == null
        ? {
            ...contextData,
            point: { x: e.clientX - 2, y: e.clientY - 4 },
          }
        : DefaultContextData
    );
  }

  async function handleSceneChanged() {
    const cam = (await viewer.ref.current?.scene())?.camera();
    if (
      cam == null ||
      config.cameraController !== provider.current?.awareness.clientID
    ) {
      return;
    }

    const c = { lookAt: cam.lookAt, position: cam.position, up: cam.up };
    if (!equal(c, config.camera)) configSetter(Keys.camera, c);
  }

  function handleSceneReady(): void {
    return setSceneReady(true);
  }

  async function handleSelect({ detail: { buttons, position }, hit }: Hit) {
    const itemId = hit?.itemId?.hex;
    console.debug({
      hitNormal: hit?.hitNormal,
      hitPoint: hit?.hitPoint,
      sceneItemId: itemId,
      sceneItemSuppliedId: hit?.itemSuppliedId?.value,
    });
    if (buttons === 2) {
      setContextData({
        ...contextData,
        selectOccurred: true,
        itemId: itemId ?? undefined,
      });
      return;
    }

    setContextData(DefaultContextData);
    if (clientId == null) return;

    const cId = clientId.toString();
    const cur = yModel.current.get(cId);
    if (pinsEnabled) {
      if (
        itemId != null &&
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
    } else if (yModel.current.get(cId)?.selectItemId != itemId) {
      yModel.current.set(cId, { ...cur, selectItemId: itemId });
    }
  }

  function handleClose() {
    setContextData(DefaultContextData);
  }

  async function handleHide() {
    const itemId = contextData.itemId;
    setContextData(DefaultContextData);
    await hideByItemId({ itemId, viewer: viewer.ref.current });
  }

  async function handleShowAll() {
    setContextData(DefaultContextData);
    await showAll({ viewer: viewer.ref.current });
  }

  return router.isReady ? (
    <Layout
      header={
        <Header
          liveSession={liveSession}
          onOpenSceneClick={() => setOpenSceneDialogOpen(true)}
        />
      }
      main={
        <Box
          sx={{ height: "100%", width: "100%" }}
          ref={mouseRef}
          onContextMenu={handleContextMenu}
        >
          {config.cameraController != null &&
            Object.keys(awareness)
              .map((k) => parseInt(k, 10))
              .filter((k) => k !== clientId)
              .map((k) => {
                const a = provider.current?.awareness.states.get(k);
                if (a == null) return;

                const mr = mouseRef.current;
                const mp = a.mousePosition;
                if (mp?.x == null || mr == null) return;

                return (
                  <Cursor
                    color={a.user.color}
                    key={k}
                    x={(mr.clientWidth / mp.elementWidth) * mp.x}
                    y={(mr.clientHeight / mp.elementHeight) * mp.y}
                  />
                );
              })}
          {viewer.isReady && (
            <Viewer
              configEnv={vertexEnv}
              credentials={config.credentials ?? DefaultCredentials}
              onSceneChanged={() => handleSceneChanged()}
              onSceneReady={() => handleSceneReady()}
              onSelect={handleSelect}
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
          )}
          <Menu
            open={contextData.selectOccurred && contextData.point != null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextData.point != null
                ? { left: contextData.point.x, top: contextData.point.y }
                : undefined
            }
          >
            <MenuItem onClick={handleHide}>Hide</MenuItem>
            <MenuItem onClick={handleShowAll}>Show All</MenuItem>
          </Menu>
        </Box>
      }
      rightDrawer={
        <RightDrawer
          messages={messages}
          participants={{
            awareness,
            cameraController: config.cameraController
              ? config.cameraController.toString()
              : undefined,
            clientId: clientId?.toString(),
            onCameraController: (control) =>
              configSetter(
                Keys.cameraController,
                control ? provider.current?.awareness.clientID : undefined
              ),
          }}
          onSend={(text) => {
            if (!userData || !clientId) return;

            const m: Message = { user: { ...userData, clientId }, text };
            pushMessages([m]);
          }}
          open
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
          credentials={config.credentials}
          onClose={() => setOpenSceneDialogOpen(false)}
          onConfirm={(cs) => {
            configSetter(Keys.credentials, cs);
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
