import { Redo, Undo, ZoomOutMap } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import * as Y from "yjs";

import { Action, AnimationDurationMs } from "./Viewer";

interface Props {
  readonly undoSelection: React.MutableRefObject<Y.UndoManager | null>;
  readonly viewer: React.MutableRefObject<HTMLVertexViewerElement | null>;
}

export function ViewerSpeedDial({ undoSelection, viewer }: Props): JSX.Element {
  const actions: Action[] = [
    {
      icon: <ZoomOutMap />,
      name: "Fit all",
      onClick: () => fitAll(),
    },
  ];

  if (undoSelection.current) {
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
    if (undoSelection.current == null) return;

    undoSelection.current.redo();
  }

  function undo(): void {
    if (undoSelection.current == null) return;

    undoSelection.current.undo();
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
