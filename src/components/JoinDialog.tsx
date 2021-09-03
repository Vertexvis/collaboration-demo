import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React from "react";

import { randomColor } from "../lib/colors";

interface Props {
  readonly open: boolean;
  readonly onSave: (name: string, color: string) => void;
}

interface Value {
  value: string;
}

const color = randomColor();

export function JoinDialog({ open, onSave }: Props): JSX.Element {
  const [name, setName] = React.useState<string>("");
  const empty = name === "";

  function handleNameChange(e: React.ChangeEvent<Value>): void {
    setName(e.target.value);
  }

  function handleSave(): void {
    if (!empty) onSave(name, color);
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <DialogTitle>Join Meeting</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
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
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
