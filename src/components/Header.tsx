import { Box, Link, Typography } from "@material-ui/core";
import React from "react";

interface Props {
  readonly meetingName?: string;
}

export function Header({ meetingName }: Props): JSX.Element {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
    >
      <Typography variant="body2">{meetingName ?? ""}</Typography>
      <Link
        href="https://github.com/Vertexvis/collaboration-demo"
        rel="noreferrer"
        style={{ alignSelf: "center" }}
        target="_blank"
      >
        View on GitHub
      </Link>
    </Box>
  );
}
