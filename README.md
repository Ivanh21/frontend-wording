# Wording Admin (Frontend)

Angular admin UI for the translation platform. Consumes the backend REST API.

## Phase 1 (Done)

- Angular 16 standalone app
- Environment config: `src/environments/environment.ts` — set `apiBaseUrl` to your backend (e.g. `http://localhost:8080`)
- Routing: `/dashboard`, `/settings`
- Shared models: `Language`, `TranslationRow`, `TranslationMatrix`, `VersionConfig`, `SaveTranslationsDto`, `PublishDto`
- `TranslationApiService`: `getTranslations()`, `saveTranslations()`, `publish()`
- Angular Material (toolbar, cards, buttons)
- Placeholder Dashboard and Settings views

## Run

```bash
npm install
npm start
```

Open http://localhost:4200. Default API base URL is `http://localhost:8090` (see `src/environments/environment.ts` and **API.md**). For production, configure `src/environments/environment.prod.ts`.

## Backend API (see API.md)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/translations` | Full matrix (nested key/lang/subKey; frontend flattens to table) |
| POST | `/api/v1/translations` | Save draft (nested body) |
| POST | `/api/v1/publish` | Publish one language (body: `{ "lang": "fr" }`) |
| GET | `/api/v1/config` | Active languages + versions (used by Settings) |

## Phase 2 (Done)

- Dashboard: load matrix via GET `/api/v1/translations`, editable table (Key + one column per language), **Save draft** (POST `/api/v1/translations`), **Publish** per language (POST `/api/v1/publish` with `languageCode`). Frontend only; backend handles translate/save/publish logic.

## Phase 3 (Done)

- Settings: **Languages** and **Published version per language** from GET `/api/v1/config`. Demo data when backend is unavailable.
