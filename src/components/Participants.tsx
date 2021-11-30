import PlayCircleOutlined from "@mui/icons-material/PlayCircleOutlined";
import ScreenShare from "@mui/icons-material/ScreenShare";
import StopCircleOutlined from "@mui/icons-material/StopCircleOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
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
