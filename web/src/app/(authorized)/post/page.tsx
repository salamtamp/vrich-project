'use client';
import { useSearchParams } from 'next/navigation';

import { PaginationProvider } from '@/contexts';

import PostDetail from './(id)/post-detail';
import Post from './post';

const PostPage = () => {
  const searchParams = useSearchParams();

  const id = searchParams.get('id');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  return (
    <div className='flex size-full flex-col'>
      {!id ? (
        <PaginationProvider defaultValue={{ limit: 15 }}>
          <Post />
        </PaginationProvider>
      ) : (
        <PaginationProvider
          defaultValue={{ limit: limit ? Number(limit) : 15, page: page ? Number(page) : 1 }}
        >
          <PostDetail />
        </PaginationProvider>
      )}
    </div>
  );
};

export default PostPage;
