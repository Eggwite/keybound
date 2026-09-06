'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;
const TabsList = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn('inline-flex items-center gap-1 border-b border-white/10', className)}
    {...props}
  />
);
const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'border-b-2 border-transparent px-3 py-2 text-xs font-medium text-[#899188] outline-none transition-colors hover:text-white data-[state=active]:border-[#b7ff4a] data-[state=active]:text-[#dfffb2] focus-visible:ring-2 focus-visible:ring-[#b7ff4a]',
      className,
    )}
    {...props}
  />
);
const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn('mt-4 outline-none', className)} {...props} />
);
export { Tabs, TabsList, TabsTrigger, TabsContent };
