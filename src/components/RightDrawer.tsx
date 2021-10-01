import {
  ExpandMore,
  PlayCircleOutlined,
  ScreenShare,
  SendOutlined,
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
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { drawerClasses } from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import React from "react";

import { Awareness, Message } from "../lib/state";
import { useKeyPress } from "../lib/useKeyPress";
import { RightDrawerWidth } from "./Layout";

interface Props {
  readonly cameraController?: string;
  readonly clientId?: string;
  readonly messages: Message[];
  readonly onCameraController: (control: boolean) => void;
  readonly onSendMessage: (text: string) => void;
  readonly open: boolean;
  readonly awareness: Record<number, Awareness>;
}

const Title = styled((props) => <Typography variant="body2" {...props} />)(
  () => ({ textTransform: "uppercase" })
);

interface Value {
  value: string;
}

export function RightDrawer({
  cameraController,
  clientId,
  messages,
  onCameraController,
  onSendMessage,
  open,
  awareness,
}: Props): JSX.Element {
  const [text, setText] = React.useState("");
  const enterPressed = useKeyPress("Enter");

  function handleTextChange(e: React.ChangeEvent<Value>): void {
    setText(e.target.value);
  }

  const handleSend = React.useCallback(() => {
    if (!text) return;

    onSendMessage(text);
    setText("");
  }, [onSendMessage, text]);

  React.useEffect(() => {
    if (!enterPressed) return;

    handleSend();
  }, [enterPressed, handleSend]);

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
      <Box sx={{ mx: 2, my: 2 }}>
        <Typography sx={{ mb: 2 }} variant="body2">
          Use the Vertex platform with open-source software to enable real-time
          3D model collaboration.
        </Typography>
        <Typography variant="body2">
          Share the URL of your session so others can join. Part selection and
          pins sync between participants. Use the play and stop buttons to
          control camera-syncing between participants.
        </Typography>
      </Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Participants</Title>
        </AccordionSummary>
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
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Chat</Title>
        </AccordionSummary>
        <List dense disablePadding>
          {messages.map((m, i) => (
            <ListItem key={i}>
              <ListItemText>
                <Typography
                  sx={{ color: m.user.color, display: "inline" }}
                  component="span"
                >
                  {m.user.name}
                </Typography>{" "}
                {m.text}
              </ListItemText>
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: "flex", m: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            onChange={handleTextChange}
            size="small"
            value={text}
          />
          <IconButton sx={{ p: 2 }} onClick={handleSend} type="submit">
            <SendOutlined color="primary" />
          </IconButton>
        </Box>
      </Accordion>
    </Drawer>
  );
}
