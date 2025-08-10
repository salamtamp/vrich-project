'use client';

import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import { PATH } from '@/constants/path.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import dayjs from '@/lib/dayjs';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

export type PostCard = CardData & { status: 'active' | 'inactive'; link?: string; customId?: string };

type PostProps = {
  disablePeriod?: boolean;
  onSelectPost?: (post: FacebookPostResponse) => void;
  itemContainerClass?: string;
  disableNotificationBell?: boolean;
  limitOptions?: number[];
};

const Post: React.FC<PostProps> = ({
  disablePeriod,
  onSelectPost,
  itemContainerClass,
  disableNotificationBell,
  limitOptions,
}) => {
  const router = useRouter();
  const { pagination, update } = usePaginationContext();
  const { page, limit } = pagination;

  const { handleConfirmPeriod, data, isLoading, since, until, handleRequest } = usePaginatedRequest<
    PaginationResponse<FacebookPostResponse>
  >({
    url: API.POST,
    defaultStartDate: disablePeriod ? dayjs().subtract(1000, 'year') : dayjs().subtract(1, 'month'),
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((post) => ({
        id: post.id,
        content: (
          <div className='flex max-w-full flex-col gap-1'>
            <p className='line-clamp-4'>{post.message ?? 'ไม่มีข้อความ'}</p>
          </div>
        ),
        lastUpdate: getRelativeTimeInThai(post.published_at),
        profile_picture_url: post.profile?.profile_picture_url,
        status: post.status,
        link: post.link,
        title: post.profile?.name,
        customId: post.post_id,
      })),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string) => {
      if (onSelectPost) {
        const selectedPost = data?.docs.find((item) => item.id === id);
        if (selectedPost) {
          onSelectPost(selectedPost);
        }
      } else {
        router.push(`${PATH.POST}?id=${id}&page=${page}&limit=${limit}&since=${since}&until=${until}`);
      }
    },
    [data?.docs, limit, onSelectPost, page, router, since, until]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      update({ search: searchTerm });
    },
    [update]
  );

  const handleReload = useCallback(() => {
    void handleRequest();
  }, [handleRequest]);

  return (
    <div className='flex size-full flex-1 overflow-hidden'>
      <FilterCard
        cardClassName='!max-h-[300px]'
        data={itemData}
        defaultEndDate={dayjs()}
        defaultStartDate={dayjs().subtract(1, 'month')}
        disableDatePicker={disablePeriod}
        disableNotificationBell={disableNotificationBell}
        isLoading={isLoading}
        itemContainerClass={itemContainerClass}
        limitOptions={limitOptions}
        skeletonSize='large'
        title='Post'
        total={data?.total}
        onCardClick={handleCardClick}
        onConfirmPeriod={handleConfirmPeriod}
        onReload={handleReload}
        onSearch={handleSearch}
      />
    </div>
  );
};
export default Post;
