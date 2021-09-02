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

interface Props {
  readonly open: boolean;
  readonly onSave: (name: string) => void;
}

interface Value {
  value: string;
}

export function NameDialog({ open, onSave }: Props): JSX.Element {
  const [name, setName] = React.useState<string>();
  const empty = name == null || name === "";

  function handleNameChange(e: React.ChangeEvent<Value>): void {
    setName(e.target.value);
  }

  function handleSave(): void {
    if (!empty) onSave(name);
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <DialogTitle id="open-scene-title">Name</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter your name.</DialogContentText>
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
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
