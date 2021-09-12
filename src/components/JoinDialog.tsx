import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React from "react";

import { randomColor } from "../lib/colors";

interface Props {
  readonly open: boolean;
  readonly onJoin: (meetingName: string, name: string, color: string) => void;
}

interface Value {
  value: string;
}

const color = randomColor();

export function JoinDialog({ open, onJoin }: Props): JSX.Element {
  const [meetingName, setMeetingName] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");

  function handleNameChange(e: React.ChangeEvent<Value>): void {
    setName(e.target.value);
  }

  function handleMeetingNameChange(e: React.ChangeEvent<Value>): void {
    setMeetingName(e.target.value);
  }

  function handleJoin(): void {
    if (name !== "" && meetingName !== "") onJoin(meetingName, name, color);
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <DialogTitle>Join Meeting</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Meeting name"
          margin="normal"
          onChange={handleMeetingNameChange}
          required
          size="small"
          value={meetingName}
        />
        <TextField
          fullWidth
          label="Name"
          margin="normal"
          onChange={handleNameChange}
          required
          size="small"
          value={name}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleJoin}>Join</Button>
      </DialogActions>
    </Dialog>
  );
}
