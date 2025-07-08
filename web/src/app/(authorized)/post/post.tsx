'use client';

import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import { PATH } from '@/constants/path.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import dayjs from '@/lib/dayjs';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

const PostContent: React.FC<{ post: FacebookPostResponse }> = ({ post }) => (
  <div className='flex max-w-full flex-col gap-1'>
    <p className='line-clamp-4'>{post.message ?? 'ไม่มีข้อความ'}</p>
  </div>
);

const Post = () => {
  const router = useRouter();

  const { handleConfirm, data, isLoading } = usePaginatedRequest<PaginationResponse<FacebookPostResponse>>({
    url: API.POST.PAGINATION,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((post) => ({
        id: post.post_id,
        content: <PostContent post={post} />,
        lastUpdate: getRelativeTimeInThai(post.created_at),
        media_url: post.media_url,
      })),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string, _: CardData) => {
      router.push(`${PATH.POST}/${id}`);
    },
    [router]
  );

  return (
    <FilterCard
      cardClassName='!max-h-[300px]'
      data={itemData}
      defaultEndDate={dayjs()}
      defaultStartDate={dayjs().subtract(6, 'day')}
      isLoading={isLoading}
      skeletonSize='large'
      title='Post'
      total={data?.total}
      onCardClick={handleCardClick}
      onConfirm={handleConfirm}
    />
  );
};
export default Post;
