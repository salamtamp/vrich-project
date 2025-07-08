import React from 'react';

type SkeletonCardProps = {
  avatarOnly?: boolean;
  disableTitle?: boolean;
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({ avatarOnly = false, disableTitle = false }) => {
  if (avatarOnly) {
    return <div className='bg-loading-container size-10 rounded-full' />;
  }
  return (
    <div className='flex w-full gap-2'>
      <div className='flex w-full flex-col overflow-hidden'>
        {!disableTitle && <div className='bg-loading-container mb-[10px] h-4 w-1/2 rounded' />}
        <div className='bg-loading-container mb-1 h-3 w-3/4 rounded' />
        <div className='bg-loading-container mb-1 h-3 w-2/3 rounded' />
        <div className='bg-loading-container h-3 w-1/2 rounded' />
      </div>
      <div className='flex min-w-12 flex-col items-end justify-between gap-1'>
        <div className='bg-loading-container size-10 rounded-full' />
        <div className='bg-loading-container h-2 w-8 rounded' />
      </div>
    </div>
  );
};

export default SkeletonCard;
