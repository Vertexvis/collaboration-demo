import {
  ExpandMore,
  PlayCircleOutlined,
  ScreenShare,
  StopCircleOutlined,
} from "@mui/icons-material";
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
} from "@mui/material";
import { drawerClasses } from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import React from "react";

import { RightDrawerWidth } from "./Layout";

interface Props {
  readonly cameraController?: string;
  readonly clientId?: string;
  readonly onCameraController: (control: boolean) => void;
  readonly open: boolean;
  readonly awareness: Record<number, Awareness>;
}

export interface Awareness {
  readonly user: User;
}

export interface UserData {
  readonly color: string;
  readonly name: string;
}

interface User extends UserData {
  readonly clientId: number;
}

const Title = styled((props) => <Typography variant="body2" {...props} />)(
  () => ({ textTransform: "uppercase" })
);

export function RightDrawer({
  cameraController,
  clientId,
  onCameraController,
  open,
  awareness,
}: Props): JSX.Element {
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
      <Box sx={{ mx: 2, mt: 2 }}>
        <Typography sx={{ mb: 2 }} variant="body2">
          The Vertex Collaboration demo shows how to use the Vertex platform
          along with open-source software to enable real-time 3D model
          collaboration.
        </Typography>
        <Typography variant="body2">
          Open a new browser tab or window and join the same meeting. Selection
          and pins sync between participants. Each participant may also click
          the play button to sync camera control.
        </Typography>
      </Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Participants</Title>
        </AccordionSummary>
        <List>
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
      </Accordion>
    </Drawer>
  );
}
