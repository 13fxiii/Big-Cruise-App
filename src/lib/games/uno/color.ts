export const UNO_COLORS = ['red', 'yellow', 'green', 'blue'] as const;
export type UnoPlayableColor = typeof UNO_COLORS[number];

export function isUnoPlayableColor(value: string): value is UnoPlayableColor {
  return (UNO_COLORS as readonly string[]).includes(value);
}
