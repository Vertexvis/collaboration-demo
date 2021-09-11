import { Theme } from "@mui/material/styles";

interface Transition {
  readonly easing: string;
  readonly duration: number;
}

export function sharpLeaving(theme: Theme): Transition {
  return {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  };
}

export function easeOutEntering(theme: Theme): Transition {
  return {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  };
}
