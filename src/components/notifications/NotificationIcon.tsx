
import { useState } from "react";
import { Bell } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/lib/notificationStore";
import NotificationList from "./NotificationList";

const NotificationIcon = () => {
  const { unreadCount, markAllAsRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      // Mark all as read when opening the notifications
      markAllAsRead();
    }
  };
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white" 
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIcon;
