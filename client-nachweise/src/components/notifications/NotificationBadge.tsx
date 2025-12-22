import { useSelector } from 'react-redux';
import { selectUnreadCount } from '@/store/slices/notificationSlice';
import { Bell } from 'lucide-react';

export default function NotificationBadge() {
  const unreadCount = useSelector(selectUnreadCount);

  return (
    <div className="relative inline-block">
      <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
