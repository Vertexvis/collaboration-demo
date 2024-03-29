import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Drawer from "@mui/material/Drawer";
import { drawerClasses } from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { Message, Value } from "../lib/state";
import { useKeyPress } from "../lib/useKeyPress";
import { Chat } from "./Chat";
import { DemoDescription } from "./DemoDescription";
import { RightDrawerWidth } from "./Layout";
import { Participants, Props as ParticipantsProps } from "./Participants";

interface Props {
  readonly messages: Message[];
  readonly participants: ParticipantsProps;
  readonly onSend: (text: string) => void;
  readonly open: boolean;
}

const Title = styled((props) => <Typography variant="body2" {...props} />)(
  () => ({ textTransform: "uppercase" })
);

export function RightDrawer({
  messages,
  participants,
  onSend,
  open,
}: Props): JSX.Element {
  const [text, setText] = React.useState("");
  const enterPressed = useKeyPress("Enter");

  function handleTextChange(e: React.ChangeEvent<Value>): void {
    setText(e.target.value);
  }

  const handleSend = React.useCallback(() => {
    if (!text) return;

    onSend(text);
    setText("");
  }, [onSend, text]);

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
      <DemoDescription />
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Participants</Title>
        </AccordionSummary>
        <Participants {...participants} />
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Title>Chat</Title>
        </AccordionSummary>
        <Chat
          messages={messages}
          onSend={handleSend}
          onTextChange={handleTextChange}
          text={text}
        />
      </Accordion>
    </Drawer>
  );
}
