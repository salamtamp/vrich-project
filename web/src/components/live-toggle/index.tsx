'use client';

import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
    <div className='flex items-center space-x-2'>
      <Switch
        checked={isLive}
        disabled={disabled}
        id='live-mode'
        onCheckedChange={handleToggle}
      />
      <Label
        className={`flex items-center space-x-1 ${isLive ? 'text-green-500' : 'text-red-500'}`}
        htmlFor='live-mode'
      >
        <span className={`size-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isLive ? 'Live' : 'Off'}</span>
      </Label>
    </div>
  );
};
