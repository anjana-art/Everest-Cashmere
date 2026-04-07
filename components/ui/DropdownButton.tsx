'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  href: string;
  label: string;
  count?: number;
}

interface DropdownButtonProps {
  label: string;
  items: DropdownItem[];
}

export default function DropdownButton({ label, items }: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-red-900 hover:bg-amber-50 rounded-lg transition-colors"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-amber-100 py-2 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex justify-between items-center px-4 py-2 hover:bg-amber-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}