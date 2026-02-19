/**
 * Types matching the backend API (see API.md).
 * GET /api/v1/translations returns an array of these.
 */
export interface RawTranslationItem {
  key: string;
  /** language code -> subKey -> value */
  values: Record<string, Record<string, string>>;
  isDraft?: boolean;
}

/**
 * POST /api/v1/translations request body.
 */
export interface RawSaveTranslationsDto {
  translations: RawTranslationItem[];
}

/**
 * POST /api/v1/publish request body.
 */
export interface RawPublishDto {
  lang: string;
}

/**
 * GET /api/v1/config response.
 */
export interface ConfigResponse {
  active_languages: string[];
  versions: Record<string, string>;
}
