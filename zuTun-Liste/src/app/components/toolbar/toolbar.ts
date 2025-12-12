import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class ToolbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get istEingeloggt(): boolean {
    return this.authService.isAuthenticated();
  }

  async logout(): Promise<void> {
    this.authService.removeToken();
    await this.router.navigate(['/']);
  }
}
