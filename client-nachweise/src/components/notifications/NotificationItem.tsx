import { Notification } from '@/store/slices/notificationSlice';
import { useTranslation } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'en' ? enUS : de;

  const typeConfig = {
    SUCCESS: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    WARNING: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    ERROR: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    INFO: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const config = typeConfig[notification.type] || typeConfig.INFO;
  const Icon = config.icon;

  const handleNotificationClick = () => {
    if (notification.status === 'UNREAD') {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg ${config.bg} ${
        config.border
      } ${
        notification.status === 'UNREAD' ? 'border-l-4' : ''
      } transition-all hover:shadow-md cursor-pointer group`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {notification.title}
              </h4>
              {notification.status === 'UNREAD' && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            {notification.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {notification.message}
              </p>
            )}
            <time className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
              {format(new Date(notification.createdAt), 'PPp', {
                locale: dateLocale,
              })}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {notification.status === 'UNREAD' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={
                locale === 'de'
                  ? 'Als gelesen markieren'
                  : 'Mark as read'
              }
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
            title={locale === 'de' ? 'Löschen' : 'Delete'}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
