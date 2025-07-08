import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { PATH } from '@/constants/path.constant';

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <div className='mx-auto max-w-md text-center'>
        <div className='mb-8'>
          <h1 className='mb-4 text-8xl font-bold text-gray-800'>404</h1>
          <h2 className='mb-2 text-xl text-gray-600'>Page not found</h2>
          <p className='text-sm text-gray-500'>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link
          className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50'
          href={PATH.LOGIN}
        >
          <ArrowLeft className='size-4' />
          Go Back
        </Link>
      </div>
    </div>
  );
}
