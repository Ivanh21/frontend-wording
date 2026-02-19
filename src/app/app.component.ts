import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <span class="brand">Wording Admin</span>
      <nav class="nav-links">
        <a mat-button routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">
          Dashboard
        </a>
        <a mat-button routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
    </mat-toolbar>
    <main class="content">
      <div class="content-inner">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: [
    `
      .app-toolbar {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .brand {
        font-weight: 500;
        letter-spacing: 0.02em;
      }
      .nav-links {
        margin-left: 2rem;
      }
      .nav-links a {
        margin-right: 0.25rem;
      }
      .nav-links a.active {
        background: rgba(255,255,255,0.15);
        font-weight: 500;
      }
      .content {
        padding: 1.5rem;
        min-height: calc(100vh - 64px);
      }
      .content-inner {
        max-width: 1200px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppComponent {}
