import { SpeedDial, SpeedDialAction } from "@material-ui/core";
import { Redo, Undo, ZoomOutMap } from "@material-ui/icons";
import * as Y from "yjs";

import { Action, AnimationDurationMs } from "./Viewer";

interface Props {
  readonly undoSelection: React.MutableRefObject<Y.UndoManager>;
  readonly viewer: React.MutableRefObject<HTMLVertexViewerElement | null>;
}

export function ViewerSpeedDial({ undoSelection, viewer }: Props): JSX.Element {
  const actions: Action[] = [
    {
      icon: <Redo />,
      name: "Redo",
      onClick: () => redo(),
    },
    {
      icon: <Undo />,
      name: "Undo",
      onClick: () => undo(),
    },
    {
      icon: <ZoomOutMap />,
      name: "Fit all",
      onClick: () => fitAll(),
    },
  ];

  function redo(): void {
    undoSelection.current.redo();
  }

  function undo(): void {
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
