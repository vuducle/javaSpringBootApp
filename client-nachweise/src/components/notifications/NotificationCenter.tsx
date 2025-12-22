import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/context/LanguageContext';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
  selectNotificationInitialized,
} from '@/store/slices/notificationSlice';
import type { AppDispatch, RootState } from '@/store';
import NotificationItem from './NotificationItem';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NotificationCenterProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NotificationCenter({
  open,
  onOpenChange,
}: NotificationCenterProps) {
  const { t, locale } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);
  const initialized = useSelector(selectNotificationInitialized);

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchNotifications({ page: 0, size: 20 }));
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    if (isOpen && initialized) {
      // Aktualisiere wenn das Modal geöffnet wird
      dispatch(fetchNotifications({ page: 0, size: 20 }));
    }
  }, [isOpen, dispatch, initialized]);

  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (notificationId: string) => {
    dispatch(deleteNotification(notificationId));
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {locale === 'de'
                ? 'Benachrichtigungen'
                : 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {notifications.length}{' '}
            {locale === 'de' ? 'Benachrichtigungen' : 'Notifications'}
          </SheetDescription>
        </SheetHeader>

        {/* Action Buttons */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="px-4 pt-4 border-b pb-4">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {locale === 'de'
                ? 'Alle als gelesen markieren'
                : 'Mark all as read'}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading && !initialized ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {locale === 'de' ? 'Wird geladen...' : 'Loading...'}
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <img
                  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3A0bnBiNG93YzAxa250Nm8wMnFnNDFqZ2d6ZjI2d3c1aHo5bHdwMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jU9OCvBiO1besabUKU/giphy.gif"
                  alt={
                    locale === 'de'
                      ? 'Keine Benachrichtigungen'
                      : 'No notifications'
                  }
                  className="w-32 h-32 mx-auto mb-4 rounded-lg"
                />
                <p className="text-gray-500 font-medium">
                  {locale === 'de'
                    ? 'Keine Benachrichtigungen'
                    : 'No notifications'}
                </p>
                <p className="text-sm text-gray-400">
                  {locale === 'de'
                    ? 'Du erhältst Benachrichtigungen zu deinen Nachweisen'
                    : 'You will receive notifications about your records'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
