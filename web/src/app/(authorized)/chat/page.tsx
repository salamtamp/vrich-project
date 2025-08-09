'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import type { FacebookCommentResponse, FacebookInboxResponse } from '@/types/api';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookProfileResponse } from '@/types/api/facebook-profile';

import ChatContent from './chatContent';
import ChatProfile from './chatProfile';
import ChatProfileList from './chatProfileList';
import SelectPlatform from './selectPlatform';
import type { ChatListItem } from './types';

import styles from './page.module.scss';

const Chat = () => {
  type PlatformType = 'all' | 'messenger' | 'fb_comments' | 'line_oa';

  const [selectedItem, setSelectedItem] = useState<ChatListItem | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('all');

  const handleSetSelectedItem = useCallback((item: ChatListItem) => {
    setSelectedItem(item);
  }, []);

  const handleSelectPlatform = useCallback((platform: PlatformType) => {
    setSelectedPlatform(platform);
  }, []);

  const { data: inboxData, handleRequest: loadMoreInbox } = usePaginatedRequest<
    PaginationResponse<FacebookInboxResponse>
  >({
    url: API.INBOX,
    additionalParams: { limit: 20, group_by: 'profile_id' },
  });

  const { data: commentData, handleRequest: loadMoreComment } = usePaginatedRequest<
    PaginationResponse<FacebookCommentResponse>
  >({
    url: API.COMMENT,
    additionalParams: { limit: 20, group_by: 'profile_id' },
  });

  // Accumulate list pane data so new pages concat with old data
  const [inboxAccum, setInboxAccum] = useState<FacebookInboxResponse[]>([]);
  const [commentAccum, setCommentAccum] = useState<FacebookCommentResponse[]>([]);
  const [inboxHasNext, setInboxHasNext] = useState(false);
  const [commentHasNext, setCommentHasNext] = useState(false);
  const [lastInboxCreatedAt, setLastInboxCreatedAt] = useState<string | null>(null);
  const [lastCommentCreatedAt, setLastCommentCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!inboxData) {
      return;
    }
    setInboxHasNext(Boolean(inboxData.has_next));
    if ((inboxData.offset ?? 0) === 0) {
      setInboxAccum(inboxData.docs ?? []);
      // Set last created_at for initial load
      if (inboxData.docs?.length) {
        const lastItem = inboxData.docs[inboxData.docs.length - 1];
        setLastInboxCreatedAt(lastItem.created_at);
      }
      return;
    }
    if (inboxData.docs?.length) {
      setInboxAccum((curr) => {
        const existingIds = new Set(curr.map((i) => i.id));
        const newDocs = (inboxData.docs ?? []).filter((d) => !existingIds.has(d.id));
        return [...curr, ...newDocs];
      });
      // Update last created_at for load more
      const lastItem = inboxData.docs[inboxData.docs.length - 1];
      setLastInboxCreatedAt(lastItem.created_at);
    }
  }, [inboxData]);

  useEffect(() => {
    if (!commentData) {
      return;
    }
    setCommentHasNext(Boolean(commentData.has_next));
    if ((commentData.offset ?? 0) === 0) {
      setCommentAccum(commentData.docs ?? []);
      // Set last created_at for initial load
      if (commentData.docs?.length) {
        const lastItem = commentData.docs[commentData.docs.length - 1];
        setLastCommentCreatedAt(lastItem.created_at);
      }
      return;
    }
    if (commentData.docs?.length) {
      setCommentAccum((curr) => {
        const existingIds = new Set(curr.map((c) => c.id));
        const newDocs = (commentData.docs ?? []).filter((d) => !existingIds.has(d.id));
        return [...curr, ...newDocs];
      });
      // Update last created_at for load more
      const lastItem = commentData.docs[commentData.docs.length - 1];
      setLastCommentCreatedAt(lastItem.created_at);
    }
  }, [commentData]);

  const items: ChatListItem[] = useMemo(() => {
    const inboxItems: ChatListItem[] = inboxAccum.map((i) => ({
      id: i.id,
      source: 'inbox',
      profile: i.profile,
      message: i.message,
      published_at: i.published_at,
      notificationCount: i.notificationCount,
    }));
    const commentItems: ChatListItem[] = commentAccum.map((c) => ({
      id: c.id,
      source: 'comment',
      profile: c.profile,
      message: c.message ?? '',
      published_at: c.published_at,
    }));

    if (selectedPlatform === 'messenger') {
      return inboxItems;
    }
    if (selectedPlatform === 'fb_comments') {
      return commentItems;
    }

    // For "All Messages", merge by profile_id and take the latest
    const allItems = [...inboxItems, ...commentItems];
    const profileGroups = new Map<string, ChatListItem>();

    allItems.forEach((item) => {
      const profileId = item.profile?.id;
      if (!profileId) {
        return;
      }

      const existing = profileGroups.get(profileId);
      if (!existing || new Date(item.published_at) > new Date(existing.published_at)) {
        profileGroups.set(profileId, item);
      }
    });

    return Array.from(profileGroups.values()).sort((a, b) =>
      new Date(a.published_at) < new Date(b.published_at) ? 1 : -1
    );
  }, [inboxAccum, commentAccum, selectedPlatform]);

  const effectiveSelected = useMemo(() => {
    if (!selectedItem && items.length) {
      return items[0];
    }
    if (selectedItem && items.some((i) => i.id === selectedItem.id)) {
      return selectedItem;
    }
    return items[0] ?? null;
  }, [items, selectedItem]);

  const { handleRequest: fetchProfile, data: selectedProfile } = useRequest<FacebookProfileResponse>({
    request: {
      url: `${API.PROFILE}/${effectiveSelected?.profile?.id ?? ''}`,
      method: 'GET',
    },
  });

  type TimelineItem = { id: string; source: 'inbox' | 'comment'; text: string; timestamp: string };
  type TimelineResponse = {
    total: number;
    docs: TimelineItem[];
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
    timestamp: string;
  };

  const { handleRequest: fetchTimeline } = useRequest<TimelineResponse>({
    request: { url: `${API.PROFILE}/${effectiveSelected?.profile?.id ?? ''}/timeline`, method: 'GET' },
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [timelineHasNext, setTimelineHasNext] = useState(false);

  const loadTimeline = useCallback(
    async (reset = false) => {
      const profileId = effectiveSelected?.profile?.id;
      if (!profileId) {
        return;
      }
      const nextOffset = reset ? 0 : timelineOffset;
      let filterType: 'messenger' | 'fb_comments' | undefined;
      if (selectedPlatform === 'messenger') {
        filterType = 'messenger';
      } else if (selectedPlatform === 'fb_comments') {
        filterType = 'fb_comments';
      } else {
        filterType = undefined;
      }

      const res = await fetchTimeline({
        params: { offset: nextOffset, limit: 10, ...(filterType ? { type: filterType } : {}) },
      });
      if (!res) {
        return;
      }
      setTimeline((curr) => {
        if (reset) {
          return res.docs;
        }
        const existingKeys = new Set(curr.map((d) => `${d.source}-${d.id}`));
        const newDocs = res.docs.filter((d) => !existingKeys.has(`${d.source}-${d.id}`));
        return [...curr, ...newDocs];
      });
      setTimelineOffset(nextOffset + (res.limit ?? 0));
      setTimelineHasNext(res.has_next ?? false);
    },
    [effectiveSelected?.profile?.id, fetchTimeline, selectedPlatform, timelineOffset]
  );

  // fetch fresh profile each selection change
  useEffect(() => {
    if (effectiveSelected?.profile?.id) {
      void fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSelected?.profile?.id]);

  useEffect(() => {
    // reset and load first page when selection changes
    if (effectiveSelected?.profile?.id) {
      setTimeline([]);
      setTimelineOffset(0);
      setTimelineHasNext(false);
      void loadTimeline(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSelected?.profile?.id]);

  return (
    <PaginationProvider>
      <div className={styles.container}>
        <SelectPlatform
          selectedPlatform={selectedPlatform}
          onSelect={handleSelectPlatform}
        />
        <div className={styles.main}>
          <ChatProfileList
            hasNext={inboxHasNext || commentHasNext}
            items={items}
            selectedItem={effectiveSelected}
            onSelect={handleSetSelectedItem}
            onLoadMore={() => {
              const nextOffsetInbox = inboxAccum.length;
              const nextOffsetComment = commentAccum.length;
              if (inboxHasNext) {
                void loadMoreInbox({
                  params: {
                    offset: nextOffsetInbox,
                    limit: inboxData?.limit ?? 20,
                    ...(lastInboxCreatedAt ? { before_created_at: lastInboxCreatedAt } : {}),
                  },
                });
              }
              if (commentHasNext) {
                void loadMoreComment({
                  params: {
                    offset: nextOffsetComment,
                    limit: commentData?.limit ?? 20,
                    ...(lastCommentCreatedAt ? { before_created_at: lastCommentCreatedAt } : {}),
                  },
                });
              }
            }}
          />
          <ChatContent
            hasNext={timelineHasNext}
            platform={selectedPlatform}
            profile={selectedProfile ?? effectiveSelected?.profile ?? null}
            timeline={timeline}
            onLoadMore={() => {
              if (timelineHasNext) {
                void loadTimeline(false);
              }
            }}
          />
          <ChatProfile
            profile={selectedProfile ?? effectiveSelected?.profile}
            onOpen={() => {
              // load all timeline data for this profile
              void loadTimeline(true);
            }}
          />
        </div>
      </div>
    </PaginationProvider>
  );
};

export default Chat;
