import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) {}

  canActivate(): boolean {
    const ok = this.auth.isAuthenticated();
    // debug log to help trace unexpected behavior
    try {
      console.debug('[AuthGuard] isAuthenticated =>', ok);
    } catch (e) {}
    if (ok) return true;
    // Not authenticated -> redirect to login
    try {
      this.router.navigate(['/login']);
    } catch (e) {
      /* ignore */
    }
    // fallback: force full redirect
    try {
      if (typeof window !== 'undefined') window.location.href = '/login';
    } catch (e) {}
    return false;
  }
}
