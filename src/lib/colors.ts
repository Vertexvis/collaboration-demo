const Gray = "#6B7280";
const Red = "#EF4444";
const Amber = "#F59E0B";
const Emerald = "#10B981";
const Blue = "#3B82F6";
const Indigo = "#6366F1";
const Violet = "#8B5CF6";
const Pink = "#EC4899";

export const DefaultColors = [
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
  return DefaultColors[Math.floor(Math.random() * DefaultColors.length)];
}
