import React, { useMemo } from 'react';

import type { Dayjs } from 'dayjs';
import { type Control, useController, type UseFormSetValue } from 'react-hook-form';

import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

import type { CampaignFormValues } from './campaign-types';

type PostSelectModalProps = {
  onSelect: (post: FacebookPostResponse) => void;
  onClose: () => void;
  control: Control<CampaignFormValues>;
  setValue: UseFormSetValue<CampaignFormValues>;
  fieldName: 'facebookComment' | 'postId';
  value?: string;
  defaultStartDate?: Dayjs;
};

const PostSelectModal: React.FC<PostSelectModalProps> = ({
  onSelect,
  control,
  setValue,
  fieldName,
  value,
  defaultStartDate,
}) => {
  const {
    data: postsData,
    isLoading,
    handleConfirmPeriod,
  } = usePaginatedRequest<{ docs: FacebookPostResponse[]; total: number }>({
    url: API.POST,
    defaultStartDate,
  });

  const postsList = useMemo(() => postsData?.docs ?? [], [postsData?.docs]);
  const total = postsData?.total ?? 0;

  const {
    field: { value: fieldValue },
    fieldState: { error },
  } = useController({ name: fieldName, control });

  const itemData = useMemo(
    () =>
      postsList?.map((post) => ({
        id: post.id,
        content: (
          <div className='flex max-w-full flex-col gap-1'>
            <p className='line-clamp-4'>{post.message ?? 'ไม่มีข้อความ'}</p>
          </div>
        ),
        lastUpdate: getRelativeTimeInThai(post.published_at),
        profile_picture_url: post.profile?.profile_picture_url,
        status: post.status,
        name: post.profile?.name,
        selected: post.id === (value ?? fieldValue),
      })) ?? [],
    [postsList, value, fieldValue]
  );

  return (
    <div className='flex h-[700px] w-[800px] max-w-full flex-col gap-4 p-4'>
      <FilterCard
        disableDatePicker
        disableNotificationBell
        cardClassName='cursor-pointer'
        cardItemClassName='grid-cols-1'
        data={itemData}
        isLoading={isLoading}
        skeletonSize='large'
        title='เลือกโพสต์ Facebook'
        total={total}
        onConfirmPeriod={handleConfirmPeriod}
        onCardClick={(_, item) => {
          const post = postsList?.find((p) => p.id === item.id);
          if (post) {
            setValue(fieldName, post.id);
            onSelect(post);
          }
        }}
      />
      {error ? <div className='mt-2 text-xs text-red-500'>{error.message}</div> : null}
    </div>
  );
};

export default PostSelectModal;
