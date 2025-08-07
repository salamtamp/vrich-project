import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground bg-gray-300 hover:bg-gray-400',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'hover:text-accent-foreground border border-input bg-background hover:bg-accent',
        secondary: 'text-secondary-foreground bg-secondary hover:bg-secondary/80',
        ghost: 'hover:text-accent-foreground hover:bg-accent',
        link: 'text-primary underline-offset-4 hover:underline',
        softgray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        container:
          'm-0 w-full max-w-full cursor-default rounded-none border-none bg-transparent p-0 font-normal text-inherit shadow-none',
      },
      size: {
        default: 'h-10 rounded-xl px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }), 'rounded-xl')}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
