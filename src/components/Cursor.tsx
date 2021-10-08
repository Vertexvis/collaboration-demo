import { Box } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { SxProps } from "@mui/system";
import React from "react";

interface Props {
  readonly color: string;
  readonly x: number;
  readonly y: number;
}

export function Cursor({ color, x, y }: Props): JSX.Element {
  const size = "0.6em";
  const shared: SxProps<Theme> = {
    backgroundColor: "inherit",
    borderTopRightRadius: "30%",
    height: size,
    position: "absolute",
    width: size,
  };

  return (
    <Box
      sx={{
        ...shared,
        backgroundColor: color,
        left: x,
        position: "relative",
        textAlign: "left",
        top: y,
        transform: "rotate(-90deg) skewX(-30deg) scale(1,.866)",
        zIndex: 1,
        "&::before": {
          ...shared,
          content: '""',
          transform:
            "rotate(-135deg) skewX(-45deg) scale(1.414,.707) translate(0,-50%)",
        },
        "&::after": {
          ...shared,
          content: '""',
          transform:
            "rotate(135deg) skewY(-45deg) scale(.707,1.414) translate(50%)",
        },
      }}
    />
  );
}
