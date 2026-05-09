import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  type: 'approved' | 'rejected' | 'update_reminder' | 'auto_hidden' | 'social_post' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Notification) => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  markAsRead: (id) =>
    set((s) => {
      const notifications = (s.notifications || []).map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),

  markAllAsRead: () =>
    set((s) => ({
      notifications: (s.notifications || []).map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...(s.notifications || [])],
      unreadCount: (s.unreadCount || 0) + 1,
    })),

  fetchNotifications: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) { set({ loading: false }); return; }

      const notifications: Notification[] = (data || []).map((row) => ({
        id: row.notification_id,
        type: row.type as Notification['type'],
        title: row.title,
        message: row.message || '',
        read: Boolean(row.read),
        createdAt: new Date(row.created_at).toISOString(),
        relatedId: row.related_id || undefined,
      }));

      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
