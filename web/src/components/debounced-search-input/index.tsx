'use client';

import { useEffect, useState } from 'react';

import { Search } from 'lucide-react';

import { Input } from '../ui/input';

type DebouncedSearchInputProps = {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
};

const DebouncedSearchInput: React.FC<DebouncedSearchInputProps> = ({
  onSearch,
  placeholder,
  delay = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, delay]);

  return (
    <Input
      leftIcon={<Search size={14} />}
      placeholder={placeholder}
      type='text'
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
      }}
    />
  );
};

export default DebouncedSearchInput;
