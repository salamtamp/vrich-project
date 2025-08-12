'use client';

import React, { useState, useEffect } from 'react';

import { Input, type InputProps } from '@/components/ui/input';

type DebouncedSearchInputProps = Omit<InputProps, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
};

const DebouncedSearchInput: React.FC<DebouncedSearchInputProps> = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounce, onChange, initialValue]);

  return <Input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
};

export default DebouncedSearchInput;
