/* @jsx jsx */ /** @jsxRuntime classic */ import { jsx } from "@emotion/react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { VertexColorPicker } from "@vertexvis/ui-react";
import React from "react";

import { randomColor } from "../lib/colors";

interface Props {
  readonly meeting?: string;
  readonly open: boolean;
  readonly onJoin: (mName: string, name: string, color: string) => void;
}

interface Value {
  value: string;
}

export function JoinDialog({ meeting, open, onJoin }: Props): JSX.Element {
  const [mName, setMName] = React.useState("");
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(randomColor());

  React.useEffect(() => {
    if (!meeting) return;

    setMName(meeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting]);

  function handleNameChange(e: React.ChangeEvent<Value>): void {
    setName(e.target.value);
  }

  function handleMeetingNameChange(e: React.ChangeEvent<Value>): void {
    setMName(e.target.value);
  }

  function handleJoin(): void {
    if (name !== "" && mName !== "") onJoin(mName, name, color);
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <DialogTitle>Join Meeting</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus={!meeting}
          fullWidth
          label="Meeting name"
          margin="normal"
          onChange={handleMeetingNameChange}
          required
          size="small"
          value={mName}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            autoFocus={!!meeting}
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
