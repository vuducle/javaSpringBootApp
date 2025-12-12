import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    try {
      return localStorage.getItem(environment.tokenStorageKey);
    } catch (e) {
      return null;
    }
  }

  setToken(token: string) {
    try {
      localStorage.setItem(environment.tokenStorageKey, token);
    } catch (e) {}
  }

  removeToken() {
    try {
      localStorage.removeItem(environment.tokenStorageKey);
    } catch (e) {}
  }

  getPayload(): any | null {
    const token = this.getToken();
    const payload = parseJwt(token);
    try {
      console.debug('[AuthService] token present:', !!token, 'payload:', payload);
    } catch (e) {}
    return payload;
  }

  isAuthenticated(): boolean {
    const payload = this.getPayload();
    if (!payload) return false;
    // If token has exp (seconds since epoch), check expiry
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    // If no exp claim, fallback to existence
    return !!this.getToken();
  }
}
