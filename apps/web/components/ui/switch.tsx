'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = ({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-white/20 bg-white/10 outline-none transition-colors data-[state=checked]:border-[#b7ff4a] data-[state=checked]:bg-[#b7ff4a] focus-visible:ring-2 focus-visible:ring-[#b7ff4a] disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-[#eef2e9] shadow transition-transform data-[state=checked]:translate-x-4" />
  </SwitchPrimitive.Root>
);
export { Switch };
