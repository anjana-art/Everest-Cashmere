// components/product/ColorSelector.tsx
'use client';

import { COLORS, getColorName } from '@/lib/constants';

interface ColorSelectorProps {
  availableColors: string[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  showLabel?: boolean;
}

export default function ColorSelector({
  availableColors,
  selectedColor,
  onColorSelect,
  showLabel = true,
}: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="text-sm font-medium text-gray-700">
          Color: {selectedColor ? getColorName(selectedColor) : 'Select'}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {availableColors.map((colorValue) => {
          const color = COLORS.find(c => c.value === colorValue);
          return (
            <button
              key={colorValue}
              type="button"
              onClick={() => onColorSelect(colorValue)}
              className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === colorValue
                  ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                backgroundColor: color?.hex || '#000000',
              }}
              title={getColorName(colorValue)}
            >
              {selectedColor === colorValue && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}