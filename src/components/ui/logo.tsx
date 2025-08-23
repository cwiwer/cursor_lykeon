import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, variant = 'light', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const BookIcon = ({ className: iconClassName }: { className?: string }) => (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
    >
      {/* Main book shape with gradient */}
      <defs>
        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      
      {/* Left page */}
      <path
        d="M20 25 L50 25 L60 35 L60 95 L50 85 L20 85 Z"
        fill={variant === 'dark' ? '#1F2937' : 'url(#bookGradient)'}
        stroke={variant === 'dark' ? '#374151' : 'none'}
        strokeWidth="1"
      />
      
      {/* Right page */}
      <path
        d="M70 25 L100 25 L100 85 L70 85 L60 95 L60 35 Z"
        fill={variant === 'dark' ? '#1F2937' : 'url(#bookGradient)'}
        stroke={variant === 'dark' ? '#374151' : 'none'}
        strokeWidth="1"
      />
      
      {/* Center spine */}
      <path
        d="M50 25 L70 25 L60 35 L60 95 L50 85 Z"
        fill={variant === 'dark' ? '#111827' : '#1E40AF'}
        opacity="0.8"
      />
      
      {/* Highlights */}
      <path
        d="M25 30 L45 30 L45 35 L25 35 Z"
        fill={variant === 'dark' ? '#4B5563' : 'rgba(255,255,255,0.3)'}
      />
      <path
        d="M75 30 L95 30 L95 35 L75 35 Z"
        fill={variant === 'dark' ? '#4B5563' : 'rgba(255,255,255,0.3)'}
      />
    </svg>
  );

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center', className)}>
        <BookIcon className={cn(sizeClasses[size], 'w-auto')} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BookIcon className={cn(sizeClasses[size], 'w-auto')} />
      <span className={cn(
        'font-bold tracking-tight',
        variant === 'dark' 
          ? 'text-foreground' 
          : 'text-foreground',
        size === 'sm' && 'text-lg',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-3xl',
        size === 'xl' && 'text-4xl'
      )}>
        Lykeon
      </span>
    </div>
  );
}