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

import { DefaultCredentials, StreamCredentials } from "../lib/config";

interface Props {
  readonly credentials: StreamCredentials;
  readonly open: boolean;
  readonly onClose: VoidFunction;
  readonly onConfirm: (credentials: StreamCredentials) => void;
}

interface Value {
  value: string;
}

export function OpenDialog({
  credentials,
  open,
  onClose,
  onConfirm,
}: Props): JSX.Element {
  const [inputCreds, setInputCreds] =
    React.useState<StreamCredentials>(credentials);
  const emptyClientId = inputCreds.clientId === "";
  const invalidClientId = inputCreds.clientId.length > 64;
  const invalidStreamKey = inputCreds.streamKey.length > 36;

  function handleClientIdChange(e: React.ChangeEvent<Value>): void {
    setInputCreds({ ...inputCreds, clientId: e.target.value });
  }

  function handleStreamKeyChange(e: React.ChangeEvent<Value>): void {
    setInputCreds({ ...inputCreds, streamKey: e.target.value });
  }

  function handleOpenSceneClick(): void {
    if (inputCreds.clientId && inputCreds.streamKey) {
      onConfirm(inputCreds);
    }
  }

  function handleRestoreDefaultsClick(): void {
    setInputCreds(DefaultCredentials);
  }

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle id="open-scene-title">Open Scene</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the client ID and stream key of your scene.
        </DialogContentText>
        <TextField
          autoFocus={emptyClientId}
          error={invalidClientId}
          fullWidth
          helperText={invalidClientId ? "Client ID too long." : undefined}
          label="Client ID"
          margin="normal"
          onChange={handleClientIdChange}
          size="small"
          value={inputCreds.clientId}
        />
        <TextField
          autoFocus={!emptyClientId}
          error={invalidStreamKey}
          fullWidth
          helperText={invalidStreamKey ? "Stream key too long." : undefined}
          label="Stream Key"
          margin="normal"
          onFocus={(e) => e.target.select()}
          onChange={handleStreamKeyChange}
          size="small"
          value={inputCreds.streamKey}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleRestoreDefaultsClick}>
          Restore Defaults
        </Button>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleOpenSceneClick}>Open Scene</Button>
      </DialogActions>
    </Dialog>
  );
}

export function encodeCreds(cs: StreamCredentials): string {
  return `/?clientId=${encodeURIComponent(
    cs.clientId
  )}&streamKey=${encodeURIComponent(cs.streamKey)}`;
}
