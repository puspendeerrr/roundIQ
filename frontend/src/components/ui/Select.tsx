import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-zinc-900 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50',
            error ? 'border-[#DC2626] focus:ring-red-500' : 'border-[#E4E4E7]',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#71717A]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
