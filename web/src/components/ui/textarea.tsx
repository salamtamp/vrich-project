import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = {} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
