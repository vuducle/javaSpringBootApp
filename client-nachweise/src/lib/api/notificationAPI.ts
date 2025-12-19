import api from '@/lib/api';

export const notificationAPI = {
  // 📋 Hole alle ungelesenen Benachrichtigungen
  getUnreadNotifications: async (page = 0, size = 20) => {
    const response = await api.get(`/api/notifications`, {
      params: { page, size },
    });
    return response.data;
  },

  // 📋 Hole ALLE Benachrichtigungen
  getAllNotifications: async (page = 0, size = 20) => {
    const response = await api.get(`/api/notifications/all`, {
      params: { page, size },
    });
    return response.data;
  },

  // 📊 Zähle ungelesene Benachrichtigungen
  getUnreadCount: async (): Promise<{
    unreadCount: number;
    hasUnread: boolean;
  }> => {
    const response = await api.get(`/api/notifications/count`);
    return response.data;
  },

  // ✅ Markiere Benachrichtigung als gelesen
  markAsRead: async (
    notificationId: string
  ): Promise<{ message: string; id: string }> => {
    const response = await api.put(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // ✅ Markiere ALLE Benachrichtigungen als gelesen
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put(`/api/notifications/read-all`);
    return response.data;
  },

  // 🗑️ Lösche Benachrichtigung
  deleteNotification: async (
    notificationId: string
  ): Promise<{ message: string; id: string }> => {
    const response = await api.delete(
      `/api/notifications/${notificationId}`
    );
    return response.data;
  },

  // 🗑️ Lösche ALLE Benachrichtigungen
  deleteAllNotifications: async (): Promise<{ message: string }> => {
    const response = await api.delete(`/api/notifications`);
    return response.data;
  },

  // 🧹 Cleanup: Lösche alte Benachrichtigungen (Admin only)
  cleanupOldNotifications: async (
    daysToKeep = 30
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/api/notifications/cleanup`, {
      params: { daysToKeep },
    });
    return response.data;
  },
};
