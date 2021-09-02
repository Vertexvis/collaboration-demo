import type { Environment } from "@vertexvis/viewer";
import equal from "fast-deep-equal/es6/react";
import React from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { randomColor } from "../lib/colors";
import { DefaultCredentials } from "../lib/config";
import { randomInt } from "../lib/random";
import { selectByItemId, updateCamera } from "../lib/scene-items";
import { useViewer } from "../lib/viewer";
import { Header } from "./Header";
import { Layout, RightDrawerWidth } from "./Layout";
import { NameDialog } from "./NameDialog";
import { Awareness, RightDrawer } from "./RightDrawer";
import { Viewer } from "./Viewer";

export interface Props {
  readonly vertexEnv: Environment;
}

const color = randomColor();

export function Home({ vertexEnv }: Props): JSX.Element {
  const viewer = useViewer();
  const provider = React.useRef<WebrtcProvider>();
  const doc = React.useRef(new Y.Doc());
  const yCamera = React.useRef(doc.current.getMap("camera"));
  const ySelection = React.useRef(doc.current.getMap("selection"));

  const [name, setName] = React.useState<string>();
  const [dialogOpen, setDialogOpen] = React.useState(!name);
  const [initialized, setInitialized] = React.useState(false);
  const [cameraController, setCameraController] = React.useState<string>();
  const [clientId, setClientId] = React.useState<number>();
  const [awareness, setAwareness] = React.useState<Record<number, Awareness>>(
    {}
  );

  React.useEffect(() => {
    if (name && !initialized && !provider.current?.connected) {
      setInitialized(true);
      provider.current = new WebrtcProvider("vertex-demo", doc.current);

      const localA: Awareness = {
        user: {
          clientId: provider.current?.awareness.clientID,
          color,
          name: name ?? "",
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
          console.log("Calling updateCamera");
          updateCamera({
            camera: yCamera.current.get("camera"),
            viewer: viewer.ref.current,
          });
        }
      });

      ySelection.current.observe(() => {
        ySelection.current.forEach(({ itemId, oldItemId }, cId) => {
          const s = provider.current?.awareness.states.get(parseInt(cId, 10));
          if (s == null) return;

          console.log(`ySelection by '${s.user.name}'`);
          selectByItemId({
            color: s.user.color,
            deselectItemId: oldItemId,
            itemId,
            viewer: viewer.ref.current,
          });
        });
      });
    }
  }, [awareness, cameraController, initialized, name]);

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
          awareness={awareness}
        />
      }
      rightDrawerWidth={RightDrawerWidth}
    >
      {dialogOpen && (
        <NameDialog
          onSave={(n: string) => {
            setName(n);
            setDialogOpen(false);
          }}
          open={dialogOpen}
        />
      )}
    </Layout>
  );
}
