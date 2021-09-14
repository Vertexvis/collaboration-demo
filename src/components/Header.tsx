import { Box, Button, Link, Typography } from "@mui/material";
import React from "react";

interface Props {
  readonly liveSession?: string;
  readonly onOpenSceneClick: () => void;
}

export function Header({ liveSession, onOpenSceneClick }: Props): JSX.Element {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
    >
      <Button onClick={() => onOpenSceneClick()} variant="contained">
        Open Scene
      </Button>
      <Typography variant="body2" sx={{ alignSelf: "center" }}>
        {liveSession ?? ""}
      </Typography>
      <Link
        href="https://github.com/Vertexvis/collaboration-demo"
        rel="noreferrer"
        sx={{ alignSelf: "center" }}
        target="_blank"
      >
        View on GitHub
      </Link>
    </Box>
  );
}
