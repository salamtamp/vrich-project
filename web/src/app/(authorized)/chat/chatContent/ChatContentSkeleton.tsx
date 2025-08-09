import React from 'react';

const ChatContentSkeleton = () => {
  return (
    <section
      aria-label='Chat content skeleton'
      className='flex w-full flex-1 flex-col rounded-lg border border-gray-200 shadow-sm'
    >
      <div className='flex items-center gap-3 border-b border-gray-200 p-4'>
        <div className='ml-[2px]'>
          <div className='bg-loading-container size-10 rounded-full' />
        </div>
        <div className='gap-2'>
          <div className='bg-loading-container h-4 w-24 rounded mb-1' />
          <div className='bg-loading-container h-3 w-16 rounded' />
        </div>
      </div>
      <div className='flex w-full flex-1 flex-col gap-4 overflow-y-auto p-[18px]'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`flex gap-4 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            {index % 2 === 0 && (
              <div className='bg-loading-container size-9 rounded-full' />
            )}
            <div className={`flex w-full max-w-[80%] flex-col ${index % 2 === 0 ? 'items-start' : 'items-end'}`}>
              <div className='bg-loading-container h-3 w-20 rounded mb-1' />
              <div className='bg-loading-container rounded-t-lg px-4 py-2 h-12 w-48 rounded-br-lg' />
            </div>
            {index % 2 === 1 && (
              <div className='bg-loading-container size-9 rounded-full' />
            )}
          </div>
        ))}
      </div>
      <div className='flex items-center gap-2 border-t border-gray-200 p-4'>
        <div className='bg-loading-container size-5 rounded' />
        <div className='bg-loading-container h-10 flex-1 rounded-md' />
        <div className='bg-loading-container size-5 rounded' />
        <div className='bg-loading-container size-5 rounded' />
        <div className='bg-loading-container size-5 rounded' />
      </div>
    </section>
  );
};

export default ChatContentSkeleton;
