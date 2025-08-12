import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'> & {
  leftIcon?: React.ReactNode;
  containerClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, type, leftIcon, ...props }, ref) => (
    <div className={cn('relative flex w-full', containerClassName)}>
      <input
        ref={ref}
        type={type}
        className={cn(
          'placeholder:flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          leftIcon ? 'pl-8' : '',
          className
        )}
        {...props}
      />
      {typeof leftIcon !== 'undefined' && leftIcon !== null ? (
        <span className='pointer-events-none absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-gray-400'>
          {leftIcon}
        </span>
      ) : null}
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
