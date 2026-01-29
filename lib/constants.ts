// lib/constants.ts
export const COLORS = [
  { name: 'baby pink', value: 'baby-pink', hex: '#F8C8DC' },
  { name: 'amber-200', value: 'amber-200', hex: '#FDE68A' },
  { name: 'black-300', value: 'black-300', hex: '#A1A1AA' },
  { name: 'gray', value: 'gray', hex: '#6B7280' },
  { name: 'sky blue', value: 'sky-blue', hex: '#7DD3FC' },
  { name: 'cream', value: 'cream', hex: '#FFFDD0' },
  { name: 'black', value: 'black', hex: '#000000' },
  { name: 'green', value: 'green', hex: '#10B981' },
  { name: 'yellow-200', value: 'yellow-200', hex: '#FEF08A' },
  { name: 'red-900', value: 'red-900', hex: '#7F1D1D' },
] as const;

export const SIZES = ['S', 'M', 'L'] as const;

export const getColorName = (colorValue: string) => {
  const color = COLORS.find(c => c.value === colorValue);
  return color ? color.name : colorValue;
};

export const getColorHex = (colorValue: string) => {
  const color = COLORS.find(c => c.value === colorValue);
  return color ? color.hex : '#000000';
};