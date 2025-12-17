import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  name: string | null = null;

  constructor(private auth: AuthService, private router: Router) {
    const payload = this.auth.getPayload();
    // common JWT fields: name, preferred_username, sub, email
    this.name =
      payload?.name || payload?.preferred_username || payload?.sub || payload?.email || null;
  }

  logout() {
    this.auth.removeToken();
    this.router.navigate(['/login']);
  }
}
