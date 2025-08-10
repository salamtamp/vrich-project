'use client';

import * as React from 'react';
import { useEffect } from 'react';

import { ChevronDown, Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Option = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  isLoading?: boolean;
  onSearch?: (searchTerm: string) => void;
  searchDelay?: number;
  noDataLabel?: string;
  className?: string;
  disabled?: boolean;
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder = 'เลือกรายการ',
  isLoading = false,
  onSearch,
  searchDelay = 300,
  noDataLabel = 'ไม่พบผลลัพธ์',
  className,
  disabled = false,
}) => {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = React.useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  // Debounced search effect
  React.useEffect(() => {
    if (!onSearch) {
      return;
    }

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, searchDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, onSearch, searchDelay]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setQuery('');
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const newValue = e.target.value;
    setQuery(newValue);
    setSearchTerm(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const displayValue = isOpen ? query : (selectedOption?.label ?? '');

  const renderDropdownContent = () => {
    if (isLoading) {
      return <div className='p-3 text-center text-gray-500'>กำลังโหลด...</div>;
    }

    if (options.length === 0) {
      return <div className='p-3 text-center text-gray-500'>{noDataLabel}</div>;
    }

    return options.map((option) => (
      <button
        key={option.value}
        type='button'
        className={cn(
          'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
          option.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
        )}
        onClick={() => {
          handleOptionSelect(option.value);
        }}
      >
        {option.label}
      </button>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
    >
      <Input
        className={cn('cursor-pointer pr-10', disabled && 'cursor-not-allowed')}
        disabled={disabled}
        leftIcon={<Search className='size-4' />}
        placeholder={placeholder}
        readOnly={!isOpen}
        value={displayValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
      />

      {/* Right icons */}
      <div className='absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1'>
        {selectedOption && !disabled ? (
          <button
            className='p-0.5 text-gray-400 hover:text-gray-600'
            type='button'
            onClick={handleClear}
          >
            <X className='size-3' />
          </button>
        ) : null}
        <ChevronDown
          className={cn(
            'size-4 text-gray-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
            disabled && 'text-gray-300'
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled ? (
        <div className='absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg'>
          {renderDropdownContent()}
        </div>
      ) : null}
    </div>
  );
};

export default SearchableSelect;
