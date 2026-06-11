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
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string, role?: string) => Promise<void>;
  addNotification: (n: Notification, role?: string) => void;
  fetchNotifications: (userId: string, role?: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  markAsRead: async (id) => {
    const currentNotifications = get().notifications || [];
    const updatedNotifications = currentNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    
    set({ 
      notifications: updatedNotifications, 
      unreadCount: updatedNotifications.filter((n) => !n.read).length 
    });

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('notification_id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to mark notification as read in database:", err);
    }
  },

  markAllAsRead: async (userId, role) => {
    if (!userId) return;

    const currentNotifications = get().notifications || [];
    const updatedNotifications = currentNotifications.map((n) => ({ ...n, read: true }));
    
    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });

    try {
      let query = supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      // Lock down tourist actions on backend entries
      if (role === 'tourist') {
        query = query.in('type', ['social_post', 'info']);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (err) {
      console.error("Failed to mark all notifications as read in database:", err);
    }
  },

  addNotification: (n, role) => {
    // Realtime streaming filtration rule
    if (role === 'tourist' && !['social_post', 'info'].includes(n.type)) {
      return; 
    }
    set((s) => ({
      notifications: [n, ...(s.notifications || [])],
      unreadCount: (s.unreadCount || 0) + 1,
    }));
  },

  fetchNotifications: async (userId, role) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      // Apply filtering rule if user role is specifically 'tourist'
      if (role === 'tourist') {
        query = query.in('type', ['social_post', 'info']);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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