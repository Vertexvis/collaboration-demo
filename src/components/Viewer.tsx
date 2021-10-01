/* @jsx jsx */ /** @jsxRuntime classic */ import { jsx } from "@emotion/react";
import { vertexvis } from "@vertexvis/frame-streaming-protos";
import { VertexIcon } from "@vertexvis/ui-react";
import type { TapEventDetails } from "@vertexvis/viewer";
import {
  JSX as ViewerJSX,
  VertexViewer,
  VertexViewerDomElement,
  VertexViewerDomRenderer,
  VertexViewerToolbar,
  VertexViewerViewCube,
} from "@vertexvis/viewer-react";
import React from "react";
import * as Y from "yjs";

import { StreamCredentials } from "../lib/config";
import { Pin } from "../lib/state";
import { PinColor, PinToolProps, ViewerSpeedDial } from "./ViewerSpeedDial";

interface ViewerProps extends ViewerJSX.VertexViewer {
  readonly credentials: StreamCredentials;
  readonly pins: Pin[];
  readonly pinTool: PinToolProps;
  readonly undoManager: React.MutableRefObject<Y.UndoManager | null>;
  readonly viewer: React.MutableRefObject<HTMLVertexViewerElement | null>;
}

export interface ActionProps {
  readonly icon: React.ReactNode;
  readonly name: string;
  readonly onClick: () => void;
}

type ViewerComponentType = React.ComponentType<
  ViewerProps & React.RefAttributes<HTMLVertexViewerElement>
>;

type HOCViewerProps = React.RefAttributes<HTMLVertexViewerElement>;

interface OnSelectProps extends HOCViewerProps {
  readonly onSelect: (hit: {
    detail: TapEventDetails;
    hit?: vertexvis.protobuf.stream.IHit;
  }) => void;
}

export const AnimationDurationMs = 1500;
export const Viewer = onTap(UnwrappedViewer);

function UnwrappedViewer({
  credentials,
  pinTool,
  pins,
  undoManager,
  viewer,
  ...props
}: ViewerProps): JSX.Element {
  return (
    <VertexViewer
      clientId={credentials.clientId}
      css={{
        height: "100%",
        width: "100%",
        cursor: pinTool.enabled ? "url(/pin.svg) 12 12, crosshair;" : "default",
      }}
      depthBuffers={pinTool.enabled ? "all" : undefined}
      ref={viewer}
      src={`urn:vertexvis:stream-key:${credentials.streamKey}`}
      {...props}
    >
      <VertexViewerDomRenderer drawMode="2d" id="viewer-pin-renderer">
        {pins.map(({ color, worldPosition }, i) => (
          <VertexViewerDomElement
            key={i}
            positionJson={JSON.stringify(worldPosition)}
          >
            <VertexIcon
              css={{ color: color ?? PinColor.enabled }}
              name="pin-fill"
            ></VertexIcon>
          </VertexViewerDomElement>
        ))}
      </VertexViewerDomRenderer>
      <VertexViewerToolbar placement="top-right">
        <VertexViewerViewCube
          css={{ marginRight: "32px" }}
          animationDuration={AnimationDurationMs}
          viewer={viewer.current ?? undefined}
        />
      </VertexViewerToolbar>
      <VertexViewerToolbar placement="bottom-right">
        <ViewerSpeedDial
          pinTool={pinTool}
          undoManager={undoManager}
          viewer={viewer}
        />
      </VertexViewerToolbar>
    </VertexViewer>
  );
}

function onTap<P extends ViewerProps>(
  WrappedViewer: ViewerComponentType
): React.FunctionComponent<P & OnSelectProps> {
  return function Component({ viewer, onSelect, ...props }: P & OnSelectProps) {
    async function handleTap(e: CustomEvent<TapEventDetails>) {
      if (props.onTap) props.onTap(e);

      if (!e.defaultPrevented) {
        const scene = await viewer.current?.scene();
        const raycaster = scene?.raycaster();

        if (raycaster != null) {
          const res = await raycaster.hitItems(e.detail.position);
          const hit = (res?.hits ?? [])[0];

          onSelect({ detail: e.detail, hit });
        }
      }
    }

    return <WrappedViewer viewer={viewer} {...props} onTap={handleTap} />;
  };
}
