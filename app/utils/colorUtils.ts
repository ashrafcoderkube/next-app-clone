export function getContrastingColor(
  hexColor: string | null | undefined
): string {
  if (!hexColor || typeof hexColor !== "string") {
    return "#111111";
  }
  const normalized = hexColor.trim().replace(/^#/, "");

  // Handle 8-character hex colors with alpha by taking only the first 6 characters
  const colorCode =
    normalized.length === 8 ? normalized.substring(0, 6) : normalized;

  if (![3, 6].includes(colorCode.length)) {
    return "#111111";
  }
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#111111" : "#ffffff";
}
