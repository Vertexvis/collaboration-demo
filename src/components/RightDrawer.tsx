import {
  Accordion,
  AccordionSummary,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { drawerClasses } from "@material-ui/core/Drawer";
import { styled } from "@material-ui/core/styles";
import {
  CameraEnhanceOutlined,
  ExpandMore,
  PlayCircleOutlined,
  StopCircleOutlined,
} from "@material-ui/icons";
import React from "react";

import { RightDrawerWidth } from "./Layout";

interface Props {
  readonly cameraController?: string;
  readonly clientId?: string;
  readonly onCameraController: (control: boolean) => void;
  readonly open: boolean;
  readonly users: Record<number, User>;
}

export interface User {
  readonly clientId: number;
  readonly color: string;
  readonly name: string;
}

const Title = styled((props) => <Typography variant="body2" {...props} />)(
  () => ({ textTransform: "uppercase" })
);

export function RightDrawer({
  cameraController,
  clientId,
  onCameraController,
  open,
  users,
}: Props): JSX.Element {
  console.log("RightDrawer", clientId, cameraController);

  return (
    <Drawer
      anchor="right"
      open={open}
      sx={{
        display: { sm: "block", xs: "none" },
        flexShrink: 0,
        width: RightDrawerWidth,
        [`& .${drawerClasses.paper}`]: { width: RightDrawerWidth },
      }}
      variant="persistent"
    >
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Participants</Title>
        </AccordionSummary>
        <List>
          {Object.entries(users).map(([k, v]) => (
            <ListItem key={k}>
              <Box
                sx={{
                  backgroundColor: v.color,
                  borderRadius: 1,
                  height: "1rem",
                  mr: 1,
                  width: "1rem",
                }}
              />
              {v.name}
              {clientId === k && cameraController != clientId && (
                <Tooltip title="Control camera">
                  <IconButton
                    color="primary"
                    onClick={() => onCameraController(true)}
                    sx={{ ml: 2 }}
                  >
                    <PlayCircleOutlined />
                  </IconButton>
                </Tooltip>
              )}
              {clientId === k && cameraController == clientId && (
                <Tooltip title="Stop camera control">
                  <IconButton
                    color="primary"
                    onClick={() => onCameraController(false)}
                    sx={{ ml: 2 }}
                  >
                    <StopCircleOutlined />
                  </IconButton>
                </Tooltip>
              )}
              {clientId !== k &&
                cameraController != clientId &&
                cameraController != null && (
                  <CameraEnhanceOutlined sx={{ ml: 3 }} />
                )}
            </ListItem>
          ))}
        </List>
      </Accordion>
    </Drawer>
  );
}
