import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '..';
import api from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  status: 'UNREAD' | 'READ';
  nachweisId: string | null;
  createdAt: string;
  readAt: string | null;
  actionUrl: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  initialized: false,
};

// 🔔 Async Thunks für API Calls
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({
    page = 0,
    size = 20,
  }: {
    page?: number;
    size?: number;
  }) => {
    const response = await api.get('/api/notifications', {
      params: { page, size },
    });
    return response.data;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    const response = await api.get('/api/notifications/count');
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    await api.put(`/api/notifications/${notificationId}/read`);
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await api.put('/api/notifications/read-all');
    return null;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    await api.delete(`/api/notifications/${notificationId}`);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // 📨 Neue Notification hinzufügen (z.B. von WebSocket/Polling)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (action.payload.status === 'UNREAD') {
        state.unreadCount += 1;
      }
    },
    // 🔄 Real-time Update
    updateNotification: (
      state,
      action: PayloadAction<Notification>
    ) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload.id
      );
      if (index !== -1) {
        const oldStatus = state.notifications[index].status;
        state.notifications[index] = action.payload;
        // Wenn Status von UNREAD zu READ gewechselt
        if (
          oldStatus === 'UNREAD' &&
          action.payload.status === 'READ'
        ) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    // 🗑️ Notification entfernen
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload
      );
      if (index !== -1) {
        if (state.notifications[index].status === 'UNREAD') {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    // 🧹 Alle Notifications löschen
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // fetchNotifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.content || [];
        state.unreadCount = state.notifications.filter(
          (n) => n.status === 'UNREAD'
        ).length;
        state.initialized = true;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to fetch notifications';
      });

    // fetchUnreadCount
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload.unreadCount || 0;
    });

    // markAsRead
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && notification.status === 'UNREAD') {
        notification.status = 'READ';
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // markAllAsRead
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        if (n.status === 'UNREAD') {
          n.status = 'READ';
          n.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    });

    // deleteNotification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload
      );
      if (index !== -1) {
        if (state.notifications[index].status === 'UNREAD') {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    });
  },
});

export const {
  addNotification,
  updateNotification,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

// 📊 Selectors
export const selectNotifications = (state: RootState) =>
  state.notifications.notifications;
export const selectUnreadCount = (state: RootState) =>
  state.notifications.unreadCount;
export const selectNotificationLoading = (state: RootState) =>
  state.notifications.loading;
export const selectNotificationError = (state: RootState) =>
  state.notifications.error;
export const selectNotificationInitialized = (state: RootState) =>
  state.notifications.initialized;

export default notificationSlice.reducer;
