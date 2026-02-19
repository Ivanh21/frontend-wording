import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  TranslationMatrix,
  SaveTranslationsDto,
  PublishDto,
} from '../../shared/models';

const API_PREFIX = '/api/v1';

/**
 * Calls the backend Admin API for translations and publish.
 * Base URL from environment.apiBaseUrl.
 */
@Injectable({ providedIn: 'root' })
export class TranslationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  /** GET /api/v1/translations — translation matrix (keys × languages). */
  getTranslations(): Observable<TranslationMatrix> {
    return this.http.get<TranslationMatrix>(`${this.baseUrl}${API_PREFIX}/translations`);
  }

  /** POST /api/v1/translations — save draft. */
  saveTranslations(body: SaveTranslationsDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}${API_PREFIX}/translations`, body);
  }

  /** POST /api/v1/publish — publish one language (generates JSON, increments version). */
  publish(payload: PublishDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}${API_PREFIX}/publish`, payload);
  }
}
