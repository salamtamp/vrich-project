'use client';

import React from 'react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

type SearchablePostSelectProps = {
  value?: string;
  onChange: (id: string) => void;
  className?: string;
};

const SearchablePostSelect: React.FC<SearchablePostSelectProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const { data, isLoading, handleRequest } = useRequest<PaginationResponse<FacebookPostResponse>>({
    request: {
      url: API.POST,
      params: { order_by: 'published_at', order: 'desc', limit: 20 },
    },
    disableFullscreenLoading: true,
  });

  const posts = React.useMemo(() => data?.docs ?? [], [data?.docs]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const timer = setTimeout(() => {
      const params =
        query.trim().length > 0
          ? { order_by: 'published_at', order: 'desc', limit: 20, search: query.trim(), search_by: 'message' }
          : { order_by: 'published_at', order: 'desc', limit: 20 };
      void handleRequest({ params });
    }, 300);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  React.useEffect(() => {
    if (open && posts.length === 0 && !isLoading) {
      void handleRequest({ params: { order_by: 'published_at', order: 'desc', limit: 20 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Select
      open={open}
      value={value}
      onOpenChange={setOpen}
      onValueChange={(val) => {
        onChange(val);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder='เลือกโพสต์' />
      </SelectTrigger>
      <SelectContent>
        <div className='p-2'>
          <Input
            placeholder='ค้นหาโพสต์...'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>

        <div className='w-[var(--radix-select-trigger-width)]'>
          {(() => {
            if (isLoading) {
              return (
                <SelectItem
                  disabled
                  value='__loading__'
                >
                  <span className='block max-w-full truncate'>กำลังโหลด...</span>
                </SelectItem>
              );
            }
            if (posts.length === 0) {
              return (
                <SelectItem
                  disabled
                  value='__no_result__'
                >
                  <span className='block max-w-full truncate'>ไม่พบผลลัพธ์</span>
                </SelectItem>
              );
            }
            return posts.map((post) => (
              <SelectItem
                key={post.id}
                value={post.id}
              >
                <span className='block max-w-full truncate'>
                  {(post.profile?.name ? `${post.profile.name} — ` : '') +
                    (post.message?.slice(0, 60) ?? 'ไม่มีข้อความ')}
                </span>
              </SelectItem>
            ));
          })()}
        </div>
      </SelectContent>
    </Select>
  );
};

export default SearchablePostSelect;
