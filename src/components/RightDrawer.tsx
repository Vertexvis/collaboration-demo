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
  ExpandMore,
  PlayCircleOutlined,
  ScreenShare,
  StopCircleOutlined,
} from "@material-ui/icons";
import React from "react";

import { RightDrawerWidth } from "./Layout";

interface Props {
  readonly cameraController?: string;
  readonly clientId?: string;
  readonly meetingName?: string;
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
  meetingName,
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
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Participants</Title>
        </AccordionSummary>
        <List>
          <ListItem>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle2">Meeting</Typography>
              <Typography variant="body2">{meetingName ?? ""}</Typography>
            </Box>
          </ListItem>
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
