/* @jsx jsx */ /** @jsxRuntime classic */ import { jsx } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { VertexColorPicker } from "@vertexvis/ui-react";
import React from "react";

import { randomColor } from "../lib/colors";
import { Value } from "../lib/state";

interface Props {
  readonly liveSession?: string;
  readonly open: boolean;
  readonly onJoin: (session: string, name: string, color: string) => void;
}

export function JoinDialog({ liveSession, open, onJoin }: Props): JSX.Element {
  const [session, setSession] = React.useState("");
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(randomColor());

  React.useEffect(() => {
    if (!liveSession) return;

    setSession(liveSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSession]);

  function handleNameChange(e: React.ChangeEvent<Value>): void {
    setName(e.target.value);
  }

  function handleLiveSessionNameChange(e: React.ChangeEvent<Value>): void {
    setSession(e.target.value);
  }

  function handleJoin(): void {
    if (name !== "" && session !== "") onJoin(session, name, color);
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <DialogTitle>Join Session</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus={!liveSession}
          fullWidth
          label="Session name"
          margin="normal"
          onChange={handleLiveSessionNameChange}
          required
          size="small"
          value={session}
        />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            autoFocus={!!liveSession}
            fullWidth
            label="Name"
            margin="normal"
            onChange={handleNameChange}
            required
            size="small"
            value={name}
          />
          <VertexColorPicker
            css={{ marginTop: "10px", marginLeft: "10px" }}
            value={color}
            onValueChanged={(e) => setColor(e.detail)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleJoin}>Join</Button>
      </DialogActions>
    </Dialog>
  );
}
