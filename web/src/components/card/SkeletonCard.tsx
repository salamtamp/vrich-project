import React from 'react';

type SkeletonCardProps = {
  avatarOnly?: boolean;
  disableTitle?: boolean;
  skeletonSize?: 'small' | 'medium' | 'large';
};

const sizeClasses = {
  small: {
    avatar: 'size-8',
    title: 'h-4 w-1/2',
    line1: 'h-3 w-3/4',
    line2: 'h-2 w-1/3',
    line3: 'h-2 w-1/4',
    time: 'h-2 w-6',
  },
  medium: {
    avatar: 'size-10',
    title: 'h-4 w-1/2',
    line1: 'h-3 w-3/4',
    line2: 'h-3 w-2/3',
    line3: 'h-3 w-1/2',
    time: 'h-2 w-8',
  },
  large: {
    avatar: 'size-14',
    title: 'h-5 w-2/3',
    line1: 'h-4 w-4/5',
    line2: 'h-4 w-3/4',
    line3: 'h-4 w-2/3',
    time: 'h-3 w-12',
  },
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  avatarOnly = false,
  disableTitle = false,
  skeletonSize = 'medium',
}) => {
  const c = sizeClasses[skeletonSize];
  if (avatarOnly) {
    return <div className={`bg-loading-container rounded-full ${c.avatar}`} />;
  }
  return (
    <div className='flex w-full gap-2'>
      <div className='flex w-full flex-col overflow-hidden'>
        {!disableTitle && <div className={`bg-loading-container mb-[10px] rounded ${c.title}`} />}
        <div className={`bg-loading-container mb-1 rounded ${c.line1}`} />
        <div className={`bg-loading-container mb-1 rounded ${c.line2}`} />
        <div className={`bg-loading-container rounded ${c.line3}`} />
      </div>
      <div className='flex min-w-12 flex-col items-end justify-between gap-1'>
        <div className={`bg-loading-container rounded-full ${c.avatar}`} />
        <div className={`bg-loading-container mr-1 rounded ${c.time}`} />
      </div>
    </div>
  );
};

export default SkeletonCard;
