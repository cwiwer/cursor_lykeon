import { useEffect, useState } from "react";
import { fetchNotifications } from "@/services/notifications";
import { Badge } from "@/components/ui/badge";

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const notifications = await fetchNotifications();
        const unread = notifications.filter(n => !n.read_at).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    loadUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="h-5 w-5 p-0 text-xs flex items-center justify-center ml-auto"
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}