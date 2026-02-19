/**
 * Single translation row: key + one value per language.
 * Backend may return isDraft per row or per language.
 */
export interface TranslationRow {
  key: string;
  /** Language code -> translated value */
  values: Record<string, string>;
  /** Optional: true if row has unsaved/draft changes */
  isDraft?: boolean;
}

/**
 * Response shape for GET /api/v1/translations (adjust to match backend).
 */
export interface TranslationMatrix {
  languages: Array<{ code: string; name: string }>;
  rows: TranslationRow[];
}

/**
 * Payload for POST /api/v1/translations (draft save).
 * Adjust to match backend (e.g. array of { key, languageCode, value }).
 */
export interface SaveTranslationsDto {
  translations: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>;
}

/**
 * Payload for POST /api/v1/publish.
 */
export interface PublishDto {
  languageCode: string;
}
