import * as React from 'react';

import { cn } from '@/lib/utils';

export type ButtonBoxProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  // You can add custom props here if needed
};

const ButtonBox = React.forwardRef<HTMLButtonElement, ButtonBoxProps>(
  ({ className, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('items-start', className)}
        type={type}
        {...props}
      />
    );
  }
);
ButtonBox.displayName = 'ButtonBox';

export { ButtonBox };
