import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import React from "react";

import { easeOutEntering, sharpLeaving } from "../lib/transitions";

export const BottomDrawerHeight = 240;
export const DenseToolbarHeight = 48;
export const LeftDrawerWidth = 240;
export const RightDrawerWidth = 320;

interface Props {
  readonly bottomDrawer?: React.ReactNode;
  readonly bottomDrawerHeight?: number;
  readonly children?: React.ReactNode;
  readonly header?: React.ReactNode;
  readonly leftDrawer?: React.ReactNode;
  readonly leftDrawerWidth?: number;
  readonly main: React.ReactNode;
  readonly rightDrawer?: React.ReactNode;
  readonly rightDrawerWidth?: number;
}

interface DrawerProps {
  leftDrawerWidth: number;
  rightDrawerWidth: number;
}

function shouldForwardProp(prop: PropertyKey): boolean {
  return (
    prop !== "bottomDrawerHeight" &&
    prop !== "leftDrawerWidth" &&
    prop !== "rightDrawerWidth" &&
    prop !== "toolbarHeight"
  );
}

const AppBar = styled(MuiAppBar, { shouldForwardProp })<DrawerProps>(
  ({ leftDrawerWidth, rightDrawerWidth, theme }) => {
    const { create } = theme.transitions;
    return {
      marginLeft: leftDrawerWidth,
      transition: create(["margin", "width"], sharpLeaving(theme)),
      zIndex: theme.zIndex.drawer + 1,
      ...(rightDrawerWidth > 0 && {
        marginRight: rightDrawerWidth,
        transition: create(["margin", "width"], easeOutEntering(theme)),
        width: `calc(100% - ${leftDrawerWidth + rightDrawerWidth}px)`,
      }),
      [theme.breakpoints.down("sm")]: {
        margin: 0,
        width: `100%`,
      },
    };
  }
);

const Main = styled("main", { shouldForwardProp })<
  DrawerProps & { bottomDrawerHeight: number; toolbarHeight: number }
>(
  ({
    bottomDrawerHeight,
    leftDrawerWidth,
    rightDrawerWidth,
    theme,
    toolbarHeight,
  }) => {
    const { create } = theme.transitions;
    return {
      flexGrow: 1,
      height: `calc(100% - ${bottomDrawerHeight + toolbarHeight}px)`,
      marginRight: -RightDrawerWidth,
      marginTop: `${toolbarHeight}px`,
      maxWidth: `calc(100% - ${leftDrawerWidth}px)`,
      transition: create("margin", sharpLeaving(theme)),
      ...(rightDrawerWidth > 0 && {
        marginRight: 0,
        transition: create("margin", easeOutEntering(theme)),
      }),
      [theme.breakpoints.down("sm")]: { width: `100%` },
      ...(rightDrawerWidth > 0 && {
        width: `calc(100% - ${leftDrawerWidth + rightDrawerWidth}px)`,
      }),
    };
  }
);

export function Layout({
  bottomDrawer,
  bottomDrawerHeight = 0,
  children,
  header,
  leftDrawer,
  leftDrawerWidth = 0,
  main,
  rightDrawer,
  rightDrawerWidth = 0,
}: Props): JSX.Element {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {header && (
        <AppBar
          color="default"
          elevation={1}
          leftDrawerWidth={leftDrawerWidth}
          position="fixed"
          rightDrawerWidth={rightDrawerWidth}
        >
          <Toolbar variant="dense">{header}</Toolbar>
        </AppBar>
      )}
      {leftDrawer ? leftDrawer : <></>}
      <Main
        bottomDrawerHeight={bottomDrawerHeight}
        leftDrawerWidth={leftDrawerWidth}
        rightDrawerWidth={rightDrawerWidth}
        toolbarHeight={header ? DenseToolbarHeight : 0}
      >
        {main}
      </Main>
      {rightDrawer ? rightDrawer : <></>}
      {children ?? <></>}
      {bottomDrawer ? bottomDrawer : <></>}
    </Box>
  );
}
