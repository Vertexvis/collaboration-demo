import { Box, Typography } from "@mui/material";
import React from "react";

export function DemoDescription(): JSX.Element {
  return (
    <Box sx={{ mx: 2, my: 2 }}>
      <Typography sx={{ mb: 2 }} variant="body2">
        Use the Vertex platform with open-source software to enable real-time 3D
        model collaboration.
      </Typography>
      <Typography variant="body2">
        Share the URL of your session so others can join. Part selection and
        pins sync between participants. Use the play and stop buttons to control
        camera-syncing between participants.
      </Typography>
    </Box>
  );
}
