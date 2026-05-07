// app/components/navigation-link.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, ReactNode } from 'react';
import { Spinner } from './spinner';

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  onClick?: () => void;
}

export function NavigationLink({ href, children, className = '', variant = 'default', onClick }: NavigationLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (onClick) onClick();
    
    // Show spinner
    setIsNavigating(true);
    
    // Navigate
    router.push(href);
  };

  return (
    <>
      {isNavigating && <Spinner />}
      <Link 
        href={href} 
        onClick={handleClick}
        className={className}
      >
        {children}
      </Link>
    </>
  );
}