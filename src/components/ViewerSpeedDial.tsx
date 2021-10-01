/* @jsx jsx */ /** @jsxRuntime classic */ import { jsx } from "@emotion/react";
import { Redo, Undo, ZoomOutMap } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import { VertexIcon } from "@vertexvis/ui-react";
import * as Y from "yjs";

import { ActionProps, AnimationDurationMs } from "./Viewer";

interface Props {
  readonly pinTool: PinToolProps;
  readonly undoManager: React.MutableRefObject<Y.UndoManager | null>;
  readonly viewer: React.MutableRefObject<HTMLVertexViewerElement | null>;
}

export interface PinToolProps {
  enabled: boolean;
  onClick: VoidFunction;
}

export const PinColor = {
  enabled: "rgba(0, 0, 255, 0.6)",
  disabled: "rgba(0, 0, 0, 0.6)",
};

export function ViewerSpeedDial({
  pinTool: { enabled, onClick },
  undoManager,
  viewer,
}: Props): JSX.Element {
  const actions: ActionProps[] = [
    {
      icon: <ZoomOutMap />,
      name: "Fit all",
      onClick: () => fitAll(),
    },
  ];

  if (undoManager.current) {
    actions.push(
      {
        icon: <Redo />,
        name: "Redo",
        onClick: () => redo(),
      },
      {
        icon: <Undo />,
        name: "Undo",
        onClick: () => undo(),
      }
    );
  }

  function redo(): void {
    if (undoManager.current == null) return;

    undoManager.current.redo();
  }

  function undo(): void {
    if (undoManager.current == null) return;

    undoManager.current.undo();
  }

  async function fitAll(): Promise<void> {
    (await viewer.current?.scene())
      ?.camera()
      .viewAll()
      .render({ animation: { milliseconds: AnimationDurationMs } });
  }

  return (
    <SpeedDial
      ariaLabel="Viewer toolbar"
      hidden={true}
      open={true}
      sx={{ mr: 3, mb: 2 }}
    >
      <SpeedDialAction
        color="primary"
        FabProps={{ color: "primary" }}
        key="Add Pin"
        icon={
          <VertexIcon
            css={{ color: enabled ? PinColor.enabled : PinColor.disabled }}
            name="pin-line"
          />
        }
        tooltipTitle="Add Pin"
        onClick={() => onClick()}
      />
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => action.onClick()}
        />
      ))}
    </SpeedDial>
  );
}
