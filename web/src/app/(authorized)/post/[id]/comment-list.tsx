/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client';
import { useCallback, useEffect } from 'react';

import Image from 'next/image';

import { ProfileMaleIcon } from '@public/assets/icon';
import { ExternalLink } from 'lucide-react';

import type { CardData } from '@/components/card';
import ContentPagination from '@/components/content/pagination';
import TextList from '@/components/text-list';
import { MockPost } from '@/components/text-list/mock';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useModalContext from '@/hooks/useContext/useModalContext';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';

import mockLogo from '../../../../../public/assets/image/logo.png';

type CommentListProps = {
  onCheckedChange?: (checked: boolean) => void;
};

const CommentList: React.FC<CommentListProps> = ({ onCheckedChange }) => {
  const data = {
    postUrl:
      'https://web.facebook.com/linemanth/posts/pfbid02QwKj1bm2BGTU1N8a4dSqht8Qapu8ZiUbZpfQD8XPrq5iZ7qZqVCsstAKyGjYASoZl',
  };
  const { update, reset } = usePaginationContext();
  const { open } = useModalContext();

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
            id={id}
          />
        ),
      });
    },
    [open]
  );

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      onCheckedChange?.(checked);
    },
    [onCheckedChange]
  );

  useEffect(() => {
    update({ limit: 50 });

    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className='flex w-full justify-between'>
        <div className='flex w-full items-center gap-4 pb-2'>
          <Image
            alt='logo'
            height={40}
            src={mockLogo}
            width={40}
          />
          <div className='flex max-w-[260px]'>
            <p className='truncate text-display-medium'>LineMan</p>
          </div>
          <Button
            className='px-3 py-2'
            variant='outline'
            onClick={() => {
              if (data.postUrl) {
                window.open(data.postUrl, '_blank');
              }
            }}
          >
            <ExternalLink />
          </Button>
        </div>

        <div className='flex h-full w-fit items-center gap-2'>
          <p className='text-nowrap'>Live Mode</p>{' '}
          <Switch
            onCheckedChange={(checked) => {
              handleCheckedChange(checked);
            }}
          />
        </div>
      </div>
      <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-100' />

      <div className='flex h-full flex-1 flex-col overflow-y-scroll'>
        {MockPost.map((c) => {
          const mock: CardData = {
            id: c.id,
            title: 'จิมมี่ ปิยะวัช',
            lastUpdate: '2 min ago',
          };
          return (
            <div
              key={c.id}
              className='mx-2 my-4'
            >
              <div
                className='flex cursor-pointer justify-between gap-2 rounded-lg px-4 py-3 hover:bg-gray-200'
                onClick={() => {
                  handleCardClick(c.id, mock);
                }}
              >
                <div className='flex flex-col gap-2'>
                  <p className='text-display-medium'> จิมมี่ ปิยะวัช</p>
                  <p>{c.text} </p>
                </div>
                <div className='flex min-w-[100px] flex-col justify-between gap-1'>
                  <div className='flex w-full justify-end'>
                    <ProfileMaleIcon />
                  </div>
                  <p className='line-clamp-1 flex justify-end text-sm-medium'>2 min ago</p>
                </div>
              </div>
              <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-300' />
            </div>
          );
        })}
      </div>

      <ContentPagination
        shotMode
        className='mt-5'
        total={MockPost.length}
      />
    </>
  );
};

export default CommentList;
