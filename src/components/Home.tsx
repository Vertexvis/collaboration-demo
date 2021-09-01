import type { Environment } from "@vertexvis/viewer";
import { useRouter } from "next/router";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { randomColor } from "../lib/colors";
import { DefaultCredentials, head, StreamCredentials } from "../lib/config";
import { randomInt } from "../lib/random";
import { selectByItemId, updateCamera } from "../lib/scene-items";
import { useViewer } from "../lib/viewer";
import { Header } from "./Header";
import { Layout, RightDrawerWidth } from "./Layout";
import { encodeCreds, OpenDialog } from "./OpenScene";
import { RightDrawer, User } from "./RightDrawer";
import { Viewer } from "./Viewer";

export interface Props {
  readonly vertexEnv: Environment;
}

const name = `User ${randomInt(1000)}`;
const color = randomColor();

export function Home({ vertexEnv }: Props): JSX.Element {
  const router = useRouter();
  const viewer = useViewer();
  const [credentials, setCredentials] = React.useState<
    StreamCredentials | undefined
  >();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const provider = React.useRef<WebrtcProvider>();
  const doc = React.useRef(new Y.Doc());
  const yCamera = React.useRef(doc.current.getMap("camera"));
  const ySelection = React.useRef(doc.current.getMap("selection"));
  const [connecting, setConnecting] = React.useState(false);
  const [cameraController, setCameraController] = React.useState<string | null>(
    null
  );
  const [clientId, setClientId] = React.useState<number>();
  const [users, setUsers] = React.useState<Record<number, User>>({});

  React.useEffect(() => {
    if (!connecting && !provider.current?.connected) {
      setConnecting(true);
      provider.current = new WebrtcProvider("vertex-demo", doc.current);
      yCamera.current.observe(() => {
        const cc = yCamera.current.get("cameraController");
        const cam = yCamera.current.get("camera");
        setCameraController(cc);
        if (
          cc !== provider.current?.awareness.clientID &&
          cameraController !== (provider.current?.awareness.clientID ?? null)
        ) {
          console.log("Calling updateCamera");
          updateCamera({ camera: cam, viewer: viewer.ref.current });
        }
      });
      ySelection.current.observe(() => {
        ySelection.current.forEach(({ itemId, oldItemId }, cId) => {
          const state = provider.current?.awareness.states.get(
            parseInt(cId, 10)
          );
          console.log(`ySelection cId=${cId}, state=${JSON.stringify(state)}`);
          selectByItemId({
            color: state?.user?.color ?? color,
            deselectItemId: oldItemId,
            itemId,
            viewer: viewer.ref.current,
          });
        });
      });
      const u: User = {
        clientId: provider.current?.awareness.clientID,
        color,
        name,
      };
      provider.current.awareness.setLocalStateField("user", u);
      // provider.current.awareness.setLocalStateField("mousePosition", u);
      setClientId(u.clientId);
      setUsers({ ...users, [u.clientId]: u });
      provider.current.awareness.on("change", () => {
        const states = provider.current?.awareness.getStates().entries();
        if (states) {
          const us: Record<number, User> = {};
          [...states]
            .filter(([, v]) => v.user != null)
            .forEach(([k, v]) => (us[k] = v.user));
          setUsers(us);
        }
      });
    }
  }, [cameraController, connecting, users]);

  // Prefer credentials in URL to enable easy scene sharing. If empty, use defaults.
  React.useEffect(() => {
    if (!router.isReady) return;

    setCredentials({
      clientId: head(router.query.clientId) || DefaultCredentials.clientId,
      streamKey: head(router.query.streamKey) || DefaultCredentials.streamKey,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // On credentials changes, update URL.
  React.useEffect(() => {
    if (credentials) router.push(encodeCreds(credentials));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials]);

  // Open dialog if 'o' key pressed
  useHotkeys("o", () => setDialogOpen(true), { keyup: true });

  return router.isReady && credentials ? (
    <Layout
      header={<Header onOpenSceneClick={() => setDialogOpen(true)} />}
      main={
        viewer.isReady && (
          <Viewer
            configEnv={vertexEnv}
            credentials={credentials}
            onFrameDrawn={(e) => {
              const { lookAt, position, up } = e.detail.scene.camera;
              const cam = { lookAt, position, up };
              if (
                cameraController ===
                  (provider.current?.awareness.clientID ?? null) &&
                JSON.stringify(cam) !==
                  JSON.stringify(yCamera.current.get("camera"))
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
              if (clientId != null) {
                ySelection.current.set(clientId.toString(), {
                  itemId: hit?.itemId?.hex,
                  oldItemId: ySelection.current.get(clientId.toString())
                    ?.itemId,
                });
              }
            }}
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
          users={users}
        />
      }
      rightDrawerWidth={RightDrawerWidth}
    >
      {dialogOpen && (
        <OpenDialog
          credentials={credentials}
          onClose={() => setDialogOpen(false)}
          onConfirm={(cs: StreamCredentials) => {
            setCredentials(cs);
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
