import React from 'react';

const ChatProfileListSkeleton = () => {
  return (
    <nav aria-label='Chat list skeleton'>
      <div className='flex h-full w-[300px] flex-col rounded-lg border border-gray-200 py-3 shadow-sm'>
        <div className='flex w-full flex-shrink-0 flex-col px-3 py-2'>
          <div className='bg-loading-container h-10 w-full rounded-md' />
        </div>
        <hr className='mt-3 flex-shrink-0' />
        <div className='flex flex-1 flex-col overflow-y-auto'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className='flex cursor-pointer gap-3 p-4'
            >
              <div className='w-fit min-w-6'>
                <div className='bg-loading-container size-10 rounded-full' />
              </div>
              <div className='flex flex-1 flex-col'>
                <div className='bg-loading-container mb-1 h-4 w-24 rounded' />
                <div className='bg-loading-container h-3 w-32 rounded' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ChatProfileListSkeleton;
