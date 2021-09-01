import { randomInt } from "./random";

interface Shades {
  dark: string;
  light: string;
}

const Gray = { light: "#D1D5DB", dark: "#374151" };
const Red = { light: "#FCA5A5", dark: "#B91C1C" };
const Amber = { light: "#FCD34D", dark: "#B45309" };
const Emerald = { light: "#6EE7B7", dark: "#047857" };
const Blue = { light: "#93C5FD", dark: "#1D4ED8" };
const Indigo = { light: "#A5B4FC", dark: "#4338CA" };
const Violet = { light: "#C4B5FD", dark: "#6D28D9" };
const Pink = { light: "#F9A8D4", dark: "#BE185D" };

export const DefaultColors: Shades[] = [
  Gray,
  Red,
  Amber,
  Emerald,
  Blue,
  Indigo,
  Violet,
  Pink,
];

export function randomColor(): string {
  const shade = randomInt(2);
  const color = DefaultColors[randomInt(DefaultColors.length)];
  return shade ? color.light : color.dark;
}
