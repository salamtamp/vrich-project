'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import type { FacebookComment } from '@/types/api/facebook-comment';
import type { FacebookInbox } from '@/types/api/facebook-inbox';
import type { FacebookPost } from '@/types/api/facebook-post';

import { useSocketContext } from './SocketContext';

type NotificationItem = {
  id: string;
  type: 'post' | 'message' | 'comment';
  title: string;
  content: string;
  timestamp: Date;
  data: FacebookPost | FacebookInbox | FacebookComment;
  isNew?: boolean;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: NotificationItem) => void;
  clearAllNotifications: () => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  animateBell: () => void;
  isAnimating: boolean;
  lastInboxEvent: number;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

type NotificationProviderProps = {
  children: React.ReactNode;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const { socket, isConnected, joinRoom } = useSocketContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastInboxEvent, setLastInboxEvent] = useState<number>(Date.now());

  const addNotification = (notification: NotificationItem) => {
    setNotifications((prev) => [notification, ...prev]);
    if (notification.isNew) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const animateBell = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  // Handle socket events for Facebook updates
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for Facebook data events from server
    const handleFacebookPost = (data: FacebookPost) => {
      const newNotification: NotificationItem = {
        id: `post-${Date.now()}`,
        type: 'post',
        title: 'New Facebook Post',
        content: data.message?.substring(0, 100) ?? 'New post created',
        timestamp: new Date(),
        data,
        isNew: true,
      };
      addNotification(newNotification);
      animateBell();
    };

    const handleFacebookInbox = (data: FacebookInbox) => {
      const newNotification: NotificationItem = {
        id: `message-${Date.now()}`,
        type: 'message',
        title: 'New Facebook Message',
        content: data.message?.substring(0, 100) ?? 'New message received',
        timestamp: new Date(),
        data,
        isNew: true,
      };
      addNotification(newNotification);
      animateBell();
      setLastInboxEvent(Date.now());
    };

    const handleFacebookComment = (data: FacebookComment) => {
      const newNotification: NotificationItem = {
        id: `comment-${Date.now()}`,
        type: 'comment',
        title: 'New Facebook Comment',
        content: data.message?.substring(0, 100) ?? 'New comment added',
        timestamp: new Date(),
        data,
        isNew: true,
      };
      addNotification(newNotification);
      animateBell();
    };

    socket.on('facebook_post.created', handleFacebookPost);
    socket.on('facebook_inbox.created', handleFacebookInbox);
    socket.on('facebook_comment.created', handleFacebookComment);

    return () => {
      socket.off('facebook_post.created', handleFacebookPost);
      socket.off('facebook_inbox.created', handleFacebookInbox);
      socket.off('facebook_comment.created', handleFacebookComment);
    };
  }, [socket]);

  // Join room when connected and authenticated
  useEffect(() => {
    if (isConnected && session?.accessToken) {
      joinRoom('facebook-updates');
    }
  }, [isConnected, session?.accessToken, joinRoom]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    clearAllNotifications,
    markAllAsRead,
    removeNotification,
    animateBell,
    isAnimating,
    lastInboxEvent,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
