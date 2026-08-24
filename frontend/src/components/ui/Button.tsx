import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-[#C2410C] text-white hover:bg-[#9A3412] active:bg-[#7C2D12]',
    secondary: 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950',
    outline: 'border border-[#E4E4E7] bg-white text-zinc-800 hover:bg-slate-50 hover:text-zinc-900',
    ghost: 'bg-transparent text-[#71717A] hover:bg-slate-100 hover:text-zinc-900 shadow-none',
    danger: 'bg-[#DC2626] text-white hover:bg-red-700 active:bg-red-800',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
