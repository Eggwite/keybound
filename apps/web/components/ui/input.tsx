import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-sm border border-white/15 bg-black/20 px-3 py-2 text-sm text-[#f4f7ef] outline-none placeholder:text-[#697066] focus:border-[#b7ff4a] focus:ring-1 focus:ring-[#b7ff4a] disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
export { Input };
