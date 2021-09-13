import { Box, Link, Typography } from "@mui/material";
import React from "react";

interface Props {
  readonly meeting?: string;
}

export function Header({ meeting }: Props): JSX.Element {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
    >
      <Typography variant="body2">{meeting ?? ""}</Typography>
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
