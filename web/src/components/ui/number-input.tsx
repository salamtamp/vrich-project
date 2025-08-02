import React from 'react';

import { Input } from './input';

type NumberInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> & {
  value?: number | string;
  onChange?: (value: number | string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  decimalPlaces?: number;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, onBlur, min, max, allowDecimal = true, decimalPlaces, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        if (inputValue === '') {
          onChange?.('');
          return;
        }

        let value = inputValue;
        if (!allowDecimal && value.includes('.')) {
          value = Math.floor(Number(value)).toString();
        } else if (allowDecimal && decimalPlaces !== undefined && value.includes('.')) {
          const [whole, decimal] = value.split('.');
          if (decimal && decimal.length > decimalPlaces) {
            value = `${whole}.${decimal.slice(0, decimalPlaces)}`;
          }
        }

        if (max !== undefined && Number(value) > max) {
          onChange?.(max.toString());
          return;
        }

        onChange?.(value);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === '') {
        onChange?.('');
        onBlur?.(e);
        return;
      }

      let value = inputValue;
      if (!allowDecimal) {
        value = Math.floor(Number(value)).toString();
      } else if (allowDecimal && decimalPlaces !== undefined && value.includes('.')) {
        const [whole, decimal] = value.split('.');
        if (decimal && decimal.length > decimalPlaces) {
          value = `${whole}.${decimal.slice(0, decimalPlaces)}`;
        }
      }
      if (max !== undefined && Number(value) > max) {
        value = max.toString();
      }

      e.target.value = value;
      onChange?.(value);
      onBlur?.(e);
    };

    let displayValue = value ?? '';
    if (typeof value === 'number') {
      displayValue = !allowDecimal ? Math.floor(value).toString() : value.toString();
    }

    return (
      <Input
        {...props}
        ref={ref}
        inputMode='decimal'
        pattern='[0-9]*[.]?[0-9]*'
        type='text'
        value={displayValue}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
export type { NumberInputProps };
