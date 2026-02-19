import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type {
  TranslationMatrix,
  TranslationRow,
  Language,
  VersionConfig,
} from '../../shared/models';
import type {
  RawTranslationItem,
  RawSaveTranslationsDto,
  ConfigResponse,
} from '../../shared/models';

const API_PREFIX = '/api/v1';

/** Language code -> display name (for Settings when API only returns codes). */
const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
};

/**
 * Flattens API response (nested key/lang/subKey) into our matrix (one row per key.subKey, flat value per lang).
 */
function flattenTranslations(raw: RawTranslationItem[]): TranslationMatrix {
  const langSet = new Set<string>();
  const rows: TranslationRow[] = [];

  for (const item of raw) {
    for (const lang of Object.keys(item.values)) {
      langSet.add(lang);
    }
  }
  const languages = Array.from(langSet).sort().map((code) => ({
    code,
    name: LANGUAGE_NAMES[code] ?? code.toUpperCase(),
  }));

  for (const item of raw) {
    const subKeys = new Set<string>();
    for (const langObj of Object.values(item.values)) {
      for (const k of Object.keys(langObj)) {
        subKeys.add(k);
      }
    }
    if (subKeys.size === 0) {
      const values: Record<string, string> = {};
      for (const lang of languages) {
        values[lang.code] = '';
      }
      rows.push({ key: item.key, values, isDraft: item.isDraft });
    } else {
      for (const subKey of subKeys) {
        const flatKey = `${item.key}.${subKey}`;
        const values: Record<string, string> = {};
        for (const lang of languages) {
          values[lang.code] = item.values[lang.code]?.[subKey] ?? '';
        }
        rows.push({
          key: flatKey,
          values,
          isDraft: item.isDraft,
        });
      }
    }
  }

  return { languages, rows };
}

/**
 * Builds nested API payload from flat edit rows (key.subKey -> values[lang]).
 */
function buildNestedPayload(
  editRows: TranslationRow[],
  languageCodes: string[]
): RawSaveTranslationsDto {
  const byParent = new Map<string, RawTranslationItem>();

  for (const row of editRows) {
    const dot = row.key.indexOf('.');
    const parentKey = dot >= 0 ? row.key.slice(0, dot) : row.key;
    const subKey = dot >= 0 ? row.key.slice(dot + 1) : row.key;

    let item = byParent.get(parentKey);
    if (!item) {
      item = {
        key: parentKey,
        values: Object.fromEntries(languageCodes.map((c) => [c, {}])),
        isDraft: true,
      };
      byParent.set(parentKey, item);
    }
    for (const code of languageCodes) {
      (item.values[code] as Record<string, string>)[subKey] = row.values[code] ?? '';
    }
  }

  return {
    translations: Array.from(byParent.values()),
  };
}

/**
 * Calls the backend Admin API (see API.md).
 * Base URL from environment.apiBaseUrl (e.g. http://localhost:8090).
 */
@Injectable({ providedIn: 'root' })
export class TranslationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  /** GET /api/v1/translations — returns matrix (flattened from API’s nested shape). */
  getTranslations(): Observable<TranslationMatrix> {
    return this.http
      .get<RawTranslationItem[]>(`${this.baseUrl}${API_PREFIX}/translations`)
      .pipe(map(flattenTranslations));
  }

  /** POST /api/v1/translations — save draft (nested payload built from flat editRows). */
  saveTranslations(editRows: TranslationRow[], languageCodes: string[]): Observable<void> {
    const body = buildNestedPayload(editRows, languageCodes);
    return this.http.post<void>(`${this.baseUrl}${API_PREFIX}/translations`, body);
  }

  /** POST /api/v1/publish — publish one language. Request body: { lang }. */
  publish(languageCode: string): Observable<{ lang: string; newVersion: string; message?: string }> {
    return this.http.post<{ lang: string; newVersion: string; message?: string }>(
      `${this.baseUrl}${API_PREFIX}/publish`,
      { lang: languageCode }
    );
  }

  /** GET /api/v1/config — active languages + versions. */
  getConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.baseUrl}${API_PREFIX}/config`);
  }

  /**
   * Maps config to languages list (codes + display names).
   * Use when you need Language[] for display.
   */
  getLanguagesFromConfig(): Observable<Language[]> {
    return this.getConfig().pipe(
      map((c) =>
        (c.active_languages ?? []).map((code) => ({
          code,
          name: LANGUAGE_NAMES[code] ?? code.toUpperCase(),
        }))
      )
    );
  }

  /**
   * Maps config to version list (languageCode + currentVersion).
   * Use when you need VersionConfig[] for display.
   */
  getVersionsFromConfig(): Observable<VersionConfig[]> {
    return this.getConfig().pipe(
      map((c) =>
        Object.entries(c.versions ?? {}).map(([languageCode, currentVersion]) => ({
          languageCode,
          currentVersion,
        }))
      )
    );
  }
}
