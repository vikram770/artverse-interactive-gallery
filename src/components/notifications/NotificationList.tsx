
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotificationStore, Notification } from "@/lib/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageSquare, UserPlus, AtSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };
  
  return (
    <Link 
      to={notification.artworkId ? `/artwork/${notification.artworkId}` : '#'}
      className={`flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors border-b last:border-b-0 ${notification.isRead ? 'opacity-70' : 'bg-slate-50'}`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={notification.senderAvatar} />
        <AvatarFallback>{notification.senderName?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <p className="text-sm font-medium">{notification.senderName}</p>
        </div>
        <p className="text-sm text-gray-600">{notification.content}</p>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
};

const NotificationList = () => {
  const { notifications, isLoading, fetchNotifications, setupRealtimeNotifications } = useNotificationStore();
  
  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime notifications
    const unsubscribe = setupRealtimeNotifications();
    
    return () => {
      unsubscribe();
    };
  }, [fetchNotifications, setupRealtimeNotifications]);
  
  if (isLoading) {
    return (
      <div className="p-3 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No notifications yet</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="p-3 border-b">
        <h3 className="font-medium">Notifications</h3>
      </div>
      <ScrollArea className="h-[350px]">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
