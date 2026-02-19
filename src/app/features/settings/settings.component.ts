import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslationApiService } from '../../core/api/translation-api.service';
import type { Language, VersionConfig } from '../../shared/models';

const DEMO_LANGUAGES: Language[] = [
  { code: 'fr', name: 'French' },
  { code: 'en', name: 'English' },
];

const CODE_TO_NAME: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', de: 'German', it: 'Italian',
};

const DEMO_VERSIONS: VersionConfig[] = [
  { languageCode: 'fr', currentVersion: 'v1' },
  { languageCode: 'en', currentVersion: 'v1' },
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="settings-card">
      <mat-card-header>
        <mat-card-title>Settings</mat-card-title>
        <mat-card-subtitle>Configured languages and published version per language.</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p *ngIf="loading"><mat-spinner diameter="24"></mat-spinner> Loading…</p>
        <div *ngIf="isDemoData && !loading" class="demo-banner">
          Backend not available — showing demo data.
        </div>
        <p *ngIf="apiError && !loading" class="error">{{ apiError }}</p>

        <ng-container *ngIf="!loading">
          <section class="section">
            <h3>Languages</h3>
            <ul *ngIf="languages.length; else noLanguages">
              <li *ngFor="let lang of languages">{{ lang.name }} ({{ lang.code | uppercase }})</li>
            </ul>
            <ng-template #noLanguages><p>No languages configured.</p></ng-template>
          </section>

          <section class="section">
            <h3>Published version per language</h3>
            <table class="version-table" *ngIf="versions.length; else noVersions">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Version</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let v of versions">
                  <td>{{ v.languageCode | uppercase }}</td>
                  <td>{{ v.currentVersion }}</td>
                </tr>
              </tbody>
            </table>
            <ng-template #noVersions><p>No version info.</p></ng-template>
          </section>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .settings-card {
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-radius: 8px;
        overflow: hidden;
      }
      .settings-card mat-card-header {
        background: #fafafa;
        padding: 1.25rem 1.5rem;
        margin: -16px -16px 0 -16px;
        border-bottom: 1px solid #eee;
      }
      .settings-card mat-card-title { margin: 0; font-size: 1.25rem; font-weight: 500; }
      .settings-card mat-card-subtitle { margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem; }
      .settings-card mat-card-content { padding: 1.5rem; }
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
      .section { margin-top: 1.75rem; }
      .section:first-of-type { margin-top: 0; }
      .section h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        font-weight: 500;
        color: #37474f;
      }
      .section ul { margin: 0; padding-left: 1.5rem; }
      .section li { margin-bottom: 0.35rem; color: #424242; }
      .version-table {
        width: auto;
        border-collapse: collapse;
        margin-top: 0.5rem;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .version-table thead { background: #37474f; color: #fff; }
      .version-table th {
        padding: 0.75rem 1.25rem;
        text-align: left;
        font-weight: 500;
        font-size: 0.875rem;
      }
      .version-table td {
        padding: 0.6rem 1.25rem;
        border-bottom: 1px solid #eee;
        background: #fff;
      }
      .version-table tbody tr:hover td { background: #fafafa; }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  private readonly api = inject(TranslationApiService);

  languages: Language[] = [];
  versions: VersionConfig[] = [];
  loading = true;
  apiError: string | null = null;
  isDemoData = false;

  ngOnInit(): void {
    this.api.getConfig().subscribe({
      next: (config) => {
        this.loading = false;
        this.languages = (config.active_languages ?? []).map((code) => ({
          code,
          name: CODE_TO_NAME[code] ?? code.toUpperCase(),
        }));
        this.versions = Object.entries(config.versions ?? {}).map(([languageCode, currentVersion]) => ({
          languageCode,
          currentVersion,
        }));
      },
      error: () => {
        this.loading = false;
        this.isDemoData = true;
        this.apiError = 'Could not reach backend';
        this.languages = DEMO_LANGUAGES;
        this.versions = DEMO_VERSIONS;
      },
    });
  }
}
