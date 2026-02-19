import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Settings</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Languages and version display will go here in Phase 3.</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class SettingsComponent {}
