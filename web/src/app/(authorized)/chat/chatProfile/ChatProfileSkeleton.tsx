import React from 'react';

const ChatProfileSkeleton = () => {
  return (
    <section
      aria-label='Chat profile skeleton'
      className='flex w-[300px] flex-col rounded-lg border border-gray-200 shadow-sm p-4'
    >
      <div className='flex flex-col items-center gap-4 border-b border-gray-200 pb-4'>
        <div className='bg-loading-container size-20 rounded-full' />
        <div className='text-center'>
          <div className='bg-loading-container h-5 w-32 rounded mb-2' />
          <div className='bg-loading-container h-3 w-24 rounded' />
        </div>
      </div>
      <div className='flex flex-col gap-4 pt-4'>
        <div>
          <div className='bg-loading-container h-4 w-20 rounded mb-2' />
          <div className='bg-loading-container h-3 w-full rounded mb-1' />
          <div className='bg-loading-container h-3 w-3/4 rounded' />
        </div>
        <div>
          <div className='bg-loading-container h-4 w-16 rounded mb-2' />
          <div className='bg-loading-container h-3 w-full rounded mb-1' />
          <div className='bg-loading-container h-3 w-2/3 rounded' />
        </div>
        <div>
          <div className='bg-loading-container h-4 w-24 rounded mb-2' />
          <div className='bg-loading-container h-3 w-full rounded' />
        </div>
      </div>
    </section>
  );
};

export default ChatProfileSkeleton;
