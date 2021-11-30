import SendOutlined from "@mui/icons-material/SendOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";

import { Message, Value } from "../lib/state";
import { AlwaysScrollToBottom } from "./AlwaysScrollToBottom";

interface Props {
  readonly messages: Message[];
  readonly onSend: () => void;
  readonly onTextChange: (e: React.ChangeEvent<Value>) => void;
  readonly text: string;
}

export function Chat({
  messages,
  onSend,
  onTextChange,
  text,
}: Props): JSX.Element {
  return (
    <>
      <List dense disablePadding sx={{ maxHeight: 350, overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <ListItem key={i}>
            <ListItemText>
              <Typography
                sx={{
                  color: m.user.color,
                  display: "inline",
                  fontWeight: "bold",
                }}
                component="span"
              >
                {m.user.name}
              </Typography>{" "}
              {m.text}
            </ListItemText>
          </ListItem>
        ))}
        <AlwaysScrollToBottom />
      </List>
      <Box sx={{ display: "flex", m: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          onChange={onTextChange}
          size="small"
          value={text}
        />
        <IconButton sx={{ p: 2 }} onClick={onSend} type="submit">
          <SendOutlined color="primary" />
        </IconButton>
      </Box>
    </>
  );
}
