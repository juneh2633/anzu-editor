export function colorToHex(color: number): string {
  // Convert decimal color to hex, handling both RGB and ARGB formats
  // If the value is larger than 24-bit (16777215), treat as ARGB and extract RGB
  if (color > 0xFFFFFF) {
    // Extract RGB from ARGB (remove alpha channel)
    color = color & 0xFFFFFF;
  }
  return `#${color.toString(16).padStart(6, '0').toUpperCase()}`;
}

export function getDifficultyColor(type: string, typeMetadata: { typeName: string; typeShortName: string; color: number }[]): string {
  // Try to match by typeName first, then by typeShortName
  const typeData = typeMetadata.find(t => t.typeName === type || t.typeShortName === type);
  return typeData ? colorToHex(typeData.color) : '#666666';
}

export function getRankColor(rank: number, rankMetadata: { idx: number; color: number }[]): string {
  const rankData = rankMetadata.find(r => r.idx === rank);
  return rankData ? colorToHex(rankData.color) : '#666666';
}