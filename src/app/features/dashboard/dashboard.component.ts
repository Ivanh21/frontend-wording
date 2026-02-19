import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Translation Editor</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Editable table (Key | FR | EN) and Publish will go here in Phase 2.</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class DashboardComponent {}
