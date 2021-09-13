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
  readonly meeting?: string;
  readonly open: boolean;
  readonly onJoin: (mName: string, name: string, color: string) => void;
}

interface Value {
  value: string;
}

const color = randomColor();

export function JoinDialog({ meeting, open, onJoin }: Props): JSX.Element {
  const [mName, setMName] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");

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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleJoin}>Join</Button>
      </DialogActions>
    </Dialog>
  );
}
