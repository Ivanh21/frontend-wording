import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslationApiService } from '../../core/api/translation-api.service';
import type { TranslationMatrix, TranslationRow } from '../../shared/models';

const DEMO_MATRIX: TranslationMatrix = {
  languages: [
    { code: 'fr', name: 'French' },
    { code: 'en', name: 'English' },
  ],
  rows: [
    { key: 'welcome.title', values: { fr: 'Bienvenue', en: 'Welcome' } },
    { key: 'welcome.subtitle', values: { fr: 'Choisissez une option', en: 'Choose an option' } },
    { key: 'common.save', values: { fr: 'Enregistrer', en: 'Save' } },
  ],
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card class="dashboard-card">
      <mat-card-header>
        <mat-card-title>Translations</mat-card-title>
        <mat-card-subtitle>Edit values, save as draft, or publish per language. Backend handles the rest.</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p *ngIf="loading"><mat-spinner diameter="24"></mat-spinner> Loading from API…</p>
        <div *ngIf="isDemoData && !loading" class="demo-banner">
          Backend not available or returned no data — showing demo data so you can try the table and buttons.
        </div>
        <p *ngIf="apiError && !loading" class="error">{{ apiError }}</p>
        <ng-container *ngIf="matrix && !loading">
          <p *ngIf="actionError" class="error">{{ actionError }}</p>
          <div class="toolbar">
            <button mat-raised-button color="primary" (click)="saveDraft()" [disabled]="saving">
              {{ saving ? 'Saving…' : 'Save draft' }}
            </button>
            <button
              *ngFor="let lang of matrix.languages; trackBy: trackByCode"
              mat-raised-button
              class="publish-btn"
              (click)="publish(lang.code)"
              [disabled]="publishing === lang.code"
            >
              {{ publishing === lang.code ? 'Publishing…' : 'Publish ' + (lang.code | uppercase) }}
            </button>
          </div>
          <div class="filter-row">
            <input
              type="text"
              class="filter-input"
              placeholder="Filter by key name…"
              [value]="keyFilter"
              (input)="onFilterInput($any($event.target).value)"
            />
            <span class="key-count">{{ keyCountLabel }}</span>
            <span class="page-size-row">
              <label>Keys per page</label>
              <select [value]="pageSize" (change)="onPageSizeChange($any($event.target).value)">
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </span>
          </div>
          <table class="translation-table">
            <thead>
              <tr>
                <th>Key</th>
                <th *ngFor="let lang of matrix.languages; trackBy: trackByCode">{{ lang.name }} ({{ lang.code | uppercase }})</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of paginatedRows; trackBy: trackByKey">
                <td class="key-cell">{{ row.key }}</td>
                <td *ngFor="let lang of matrix.languages; trackBy: trackByCode">
                  <input
                    type="text"
                    [value]="row.values[lang.code]"
                    (input)="setValue(row, lang.code, $any($event.target).value)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination-bar" *ngIf="totalPages > 0">
            <span class="pagination-range">{{ paginationRangeLabel }}</span>
            <div class="pagination-controls">
              <button mat-button (click)="goToPage(currentPage - 1)" [disabled]="currentPage <= 1">Previous</button>
              <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
              <button mat-button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages">Next</button>
            </div>
          </div>
          <p *ngIf="filteredRows.length === 0">{{ keyFilter ? 'No keys match your filter.' : 'No keys.' }}</p>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .dashboard-card {
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-radius: 8px;
        overflow: hidden;
      }
      .dashboard-card mat-card-header {
        background: #fafafa;
        padding: 1.25rem 1.5rem;
        margin: -16px -16px 0 -16px;
        border-bottom: 1px solid #eee;
      }
      .dashboard-card mat-card-title { margin: 0; font-size: 1.25rem; font-weight: 500; }
      .dashboard-card mat-card-subtitle { margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem; }
      .dashboard-card mat-card-content { padding: 1.5rem; }
      .error { color: #b71c1c; font-size: 0.9rem; margin: 0 0 0.75rem 0; }
      .demo-banner {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        color: #0d47a1;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.25rem;
        font-size: 0.9rem;
        border-left: 4px solid #1976d2;
      }
      .toolbar {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      .publish-btn {
        background: #42a5f5 !important;
        color: #fff !important;
      }
      .publish-btn:hover:not([disabled]) {
        background: #1e88e5 !important;
      }
      .publish-btn[disabled] {
        background: #90caf9 !important;
        color: rgba(255,255,255,0.8) !important;
      }
      .filter-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }
      .filter-input {
        padding: 0.6rem 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        min-width: 260px;
        font-size: 0.95rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .filter-input::placeholder { color: #9e9e9e; }
      .filter-input:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
      }
      .key-count { color: #757575; font-size: 0.875rem; }
      .page-size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
      }
      .page-size-row label { font-size: 0.875rem; color: #666; }
      .page-size-row select {
        padding: 0.4rem 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.9rem;
        background: #fff;
      }
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }
      .pagination-range { color: #757575; font-size: 0.9rem; }
      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .page-indicator { font-size: 0.9rem; color: #424242; }
      .translation-table {
        width: 100%;
        border-collapse: collapse;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .translation-table thead {
        background: #37474f;
        color: #fff;
      }
      .translation-table th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 500;
        font-size: 0.875rem;
      }
      .translation-table td {
        padding: 0.5rem 1rem;
        border-bottom: 1px solid #eee;
        vertical-align: middle;
      }
      .translation-table tbody tr {
        background: #fff;
        transition: background 0.15s;
      }
      .translation-table tbody tr:nth-child(even) { background: #fafafa; }
      .translation-table tbody tr:hover { background: #f5f5f5; }
      .translation-table input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: border-color 0.2s;
      }
      .translation-table input:focus {
        outline: none;
        border-color: #1976d2;
      }
      .key-cell {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 0.875rem;
        background: #f5f5f5;
        color: #424242;
        font-weight: 500;
      }
      .dashboard-card p:last-child {
        margin: 1rem 0 0 0;
        color: #757575;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(TranslationApiService);

  matrix: TranslationMatrix | null = null;
  editRows: TranslationRow[] = [];
  loading = true;
  apiError: string | null = null;
  isDemoData = false;
  saving = false;
  publishing: string | null = null;
  actionError: string | null = null;
  keyFilter = '';
  currentPage = 1;
  pageSize = 10;

  trackByCode = (_: number, item: { code: string }) => item.code;
  trackByKey = (_: number, item: TranslationRow) => item.key;

  onFilterInput(value: string): void {
    this.keyFilter = value;
    this.currentPage = 1;
  }

  onPageSizeChange(value: string): void {
    this.pageSize = Number(value);
    this.currentPage = 1;
  }

  get filteredRows(): TranslationRow[] {
    const q = this.keyFilter.trim().toLowerCase();
    if (!q) return this.editRows;
    return this.editRows.filter((row) => row.key.toLowerCase().includes(q));
  }

  get totalPages(): number {
    const n = this.filteredRows.length;
    if (n === 0) return 0;
    return this.pageSize > 0 ? Math.ceil(n / this.pageSize) : 1;
  }

  get paginatedRows(): TranslationRow[] {
    const rows = this.filteredRows;
    const total = this.totalPages;
    const page = Math.min(Math.max(1, this.currentPage), total);
    const start = (page - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  get keyCountLabel(): string {
    const total = this.editRows.length;
    const shown = this.filteredRows.length;
    if (this.keyFilter.trim()) return `Showing ${shown} of ${total} keys`;
    return total === 1 ? '1 key' : `${total} keys`;
  }

  get paginationRangeLabel(): string {
    const total = this.filteredRows.length;
    if (total === 0) return '0 keys';
    const page = Math.min(Math.max(1, this.currentPage), this.totalPages);
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return `${start}–${end} of ${total} keys`;
  }

  goToPage(page: number): void {
    const p = Math.max(1, Math.min(page, this.totalPages));
    this.currentPage = p;
  }

  ngOnInit(): void {
    this.api.getTranslations().subscribe({
      next: (m) => {
        this.loading = false;
        if (m.rows.length === 0) {
          this.matrix = DEMO_MATRIX;
          this.isDemoData = true;
          this.editRows = DEMO_MATRIX.rows.map((r) => ({
            key: r.key,
            values: { ...r.values },
          }));
        } else {
          this.matrix = m;
          this.editRows = m.rows.map((r) => ({
            key: r.key,
            values: { ...r.values },
          }));
        }
      },
      error: (err) => {
        this.loading = false;
        this.apiError = err?.message ?? 'Could not reach backend';
        this.matrix = DEMO_MATRIX;
        this.isDemoData = true;
        this.editRows = DEMO_MATRIX.rows.map((r) => ({
          key: r.key,
          values: { ...r.values },
        }));
      },
    });
  }

  setValue(row: TranslationRow, code: string, value: string): void {
    row.values[code] = value;
    this.editRows = [...this.editRows];
  }

  saveDraft(): void {
    if (!this.matrix) return;
    this.actionError = null;
    this.saving = true;
    const languageCodes = this.matrix.languages.map((l) => l.code);
    this.api.saveTranslations(this.editRows, languageCodes).subscribe({
      next: () => {
        this.saving = false;
        this.reload();
      },
      error: () => {
        this.saving = false;
        this.actionError = 'Save failed. Is the backend running?';
      },
    });
  }

  publish(languageCode: string): void {
    this.actionError = null;
    this.publishing = languageCode;
    this.api.publish(languageCode).subscribe({
      next: () => {
        this.publishing = null;
        this.reload();
      },
      error: () => {
        this.publishing = null;
        this.actionError = 'Publish failed. Is the backend running?';
      },
    });
  }

  private reload(): void {
    this.api.getTranslations().subscribe({
      next: (m) => {
        this.matrix = m;
        this.editRows = m.rows.map((r) => ({
          key: r.key,
          values: { ...r.values },
        }));
      },
    });
  }
}
