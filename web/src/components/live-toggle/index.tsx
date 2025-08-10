'use client';

import { useState } from 'react';

type LiveToggleProps = {
  initialState?: boolean;
  onToggle?: (isLive: boolean) => void;
  disabled?: boolean;
};

export const LiveToggle = ({ initialState = false, onToggle, disabled = false }: LiveToggleProps) => {
  const [isLive, setIsLive] = useState(initialState);

  const handleToggle = (checked: boolean) => {
    setIsLive(checked);
    onToggle?.(checked);
  };

  return (
    <button
      className={`relative h-10 w-20 transform cursor-pointer rounded-xl transition-all duration-300 ease-in-out ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${isLive ? 'bg-green-500' : 'bg-red-600'} shadow-lg`}
      onClick={() => {
        if (!disabled) {
          handleToggle(!isLive);
        }
      }}
    >
      {/* Left section (LIVE) */}
      <div
        className={`absolute left-0 top-0 h-full rounded-l-xl transition-all duration-300 ${
          isLive ? 'w-[90%] bg-green-500' : 'w-[10%] bg-gray-300'
        }`}
      >
        <span
          className={`absolute inset-0 flex select-none items-center justify-center font-bold transition-colors duration-300 ${
            isLive ? 'text-lg text-white' : 'text-sm text-gray-500'
          }`}
        >
          {isLive ? 'LIVE' : null}
        </span>
      </div>

      {/* Right section (OFF) */}
      <div
        className={`absolute right-0 top-0 h-full rounded-r-xl transition-all duration-300 ${
          !isLive ? 'w-[90%] bg-red-600' : 'w-[10%] bg-gray-300'
        }`}
      >
        <span
          className={`absolute inset-0 flex select-none items-center justify-center font-bold transition-colors duration-300 ${
            !isLive ? 'text-lg text-white' : 'text-sm text-gray-500'
          }`}
        >
          {!isLive && 'OFF'}
        </span>
      </div>
    </button>
  );
};
