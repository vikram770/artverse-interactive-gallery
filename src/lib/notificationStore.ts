
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "./store";

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  content: string;
  artworkId?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setupRealtimeNotifications: () => () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      fetchNotifications: async () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;

        try {
          set({ isLoading: true });
          
          const { data, error } = await supabase
            .from('notifications')
            .select(`
              id,
              type,
              content,
              artwork_id,
              sender_id,
              is_read,
              created_at,
              profiles:sender_id (username, avatar)
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const notifications: Notification[] = (data || []).map(item => {
            // Extract profile data properly - it's an object, not an array
            const profile = item.profiles || {};
            
            return {
              id: item.id,
              userId: currentUser.id,
              type: item.type as 'like' | 'comment' | 'follow' | 'mention',
              content: item.content,
              artworkId: item.artwork_id,
              senderId: item.sender_id,
              // Use optional chaining with fallback for TypeScript safety
              senderName: profile?.username as string || 'Unknown User',
              senderAvatar: profile?.avatar as string | undefined,
              isRead: item.is_read,
              createdAt: item.created_at
            };
          });
          
          const unreadCount = notifications.filter(n => !n.isRead).length;
          
          set({ 
            notifications, 
            unreadCount,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ isLoading: false });
        }
      },

      markAsRead: async (id: string) => {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
          
          if (error) throw error;
          
          const { notifications } = get();
          const updatedNotifications = notifications.map(n => 
            n.id === id ? { ...n, isRead: true } : n
          );
          
          const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
          
          set({ notifications: updatedNotifications, unreadCount });
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      },

      markAllAsRead: async () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;
        
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', currentUser.id)
            .eq('is_read', false);
          
          if (error) throw error;
          
          const { notifications } = get();
          const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
          
          set({ notifications: updatedNotifications, unreadCount: 0 });
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      },

      setupRealtimeNotifications: () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return () => {};
        
        // Subscribe to realtime notifications
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${currentUser.id}`
            },
            async (payload) => {
              // Fetch the complete notification with sender info
              const { data, error } = await supabase
                .from('notifications')
                .select(`
                  id,
                  type,
                  content,
                  artwork_id,
                  sender_id,
                  is_read,
                  created_at,
                  profiles:sender_id (username, avatar)
                `)
                .eq('id', payload.new.id)
                .single();
              
              if (error) {
                console.error('Error fetching new notification:', error);
                return;
              }
              
              // Extract profile data properly - it's an object, not an array
              const profile = data.profiles || {};
              
              const newNotification: Notification = {
                id: data.id,
                userId: currentUser.id,
                type: data.type as 'like' | 'comment' | 'follow' | 'mention',
                content: data.content,
                artworkId: data.artwork_id,
                senderId: data.sender_id,
                // Use optional chaining with fallback for TypeScript safety
                senderName: profile?.username as string || 'Unknown User',
                senderAvatar: profile?.avatar as string | undefined,
                isRead: data.is_read,
                createdAt: data.created_at
              };
              
              const { notifications, unreadCount } = get();
              
              // Show toast for new notification
              toast.info(newNotification.content, {
                action: {
                  label: "View",
                  onClick: () => {
                    if (newNotification.artworkId) {
                      window.location.href = `/artwork/${newNotification.artworkId}`;
                    }
                  }
                }
              });
              
              set({
                notifications: [newNotification, ...notifications],
                unreadCount: unreadCount + 1
              });
            }
          )
          .subscribe();
        
        // Return unsubscribe function
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }),
    {
      name: 'notification-storage'
    }
  )
);
