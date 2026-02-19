import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Wording Admin</span>
      <nav class="nav-links">
        <a mat-button routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">
          Dashboard
        </a>
        <a mat-button routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
    </mat-toolbar>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .nav-links {
        margin-left: 1.5rem;
      }
      .nav-links a {
        margin-right: 0.5rem;
      }
      .nav-links a.active {
        font-weight: 600;
      }
      .content {
        padding: 1.5rem;
      }
    `,
  ],
})
export class AppComponent {}
