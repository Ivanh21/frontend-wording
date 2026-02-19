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

Open http://localhost:4200. Default API base URL is `http://localhost:8080` (see `src/environments/environment.ts`). For production, configure `src/environments/environment.prod.ts`.

## Backend endpoints used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/translations` | Translation matrix |
| POST | `/api/v1/translations` | Save draft |
| POST | `/api/v1/publish` | Publish (body: `{ "languageCode": "fr" }`) |

## Next (Phase 2)

- Dashboard: load matrix, editable table (Key \| FR \| EN), draft indicator, Save draft, Publish per language.
