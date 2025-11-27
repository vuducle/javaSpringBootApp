
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export interface User {
  id: string;
  token: string;
  refreshToken: string;
  email: string;
  isLoggedIn: boolean;
}

const initialState: User = {
  id: '',
  token: '',
  refreshToken: '',
  email: '',
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.email = action.payload.email;
      state.isLoggedIn = action.payload.isLoggedIn;
    },
    clearUser: (state) => {
      state.id = '';
      state.token = '';
      state.refreshToken = '';
      state.email = '';
      state.isLoggedIn = false;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    }
  },
});

export const { setUser, clearUser, updateAccessToken } = userSlice.actions;

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
