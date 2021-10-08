import {
  PlayCircleOutlined,
  ScreenShare,
  StopCircleOutlined,
} from "@mui/icons-material";
import { Box, IconButton, List, ListItem, Tooltip } from "@mui/material";
import React from "react";

import { Awareness } from "../lib/state";

export interface Props {
  readonly awareness: Record<number, Awareness>;
  readonly clientId?: string;
  readonly cameraController?: string;
  readonly onCameraController: (control: boolean) => void;
}

export function Participants({
  awareness,
  clientId,
  cameraController,
  onCameraController,
}: Props): JSX.Element {
  return (
    <List dense>
      {Object.entries(awareness).map(([k, v]) => (
        <ListItem key={k}>
          <Box
            sx={{
              backgroundColor: v.user.color,
              borderRadius: 1,
              height: "1rem",
              mr: 1,
              width: "1rem",
            }}
          />
          {v.user.name}
          {clientId === k ? (
            cameraController == clientId ? (
              <Tooltip title="Stop camera control">
                <IconButton
                  color="primary"
                  onClick={() => onCameraController(false)}
                  sx={{ ml: 1 }}
                >
                  <StopCircleOutlined />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Control camera">
                <IconButton
                  color="primary"
                  onClick={() => onCameraController(true)}
                  sx={{ ml: 1 }}
                >
                  <PlayCircleOutlined />
                </IconButton>
              </Tooltip>
            )
          ) : cameraController != clientId && cameraController == k ? (
            <ScreenShare color="action" sx={{ ml: 2 }} />
          ) : (
            <></>
          )}
        </ListItem>
      ))}
    </List>
  );
}
