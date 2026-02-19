# Testing the APIs

Use **Postman** (or the `.http` file in VS Code with REST Client). No other setup needed.

**Base URL:** `http://localhost:8090` — start your backend first.

---

## Postman

1. Open Postman → **Import** → **File**.
2. Select: **`postman/Wording-Admin-API.postman_collection.json`**.
3. The collection has 4 requests:
   - **GET translations** — full matrix
   - **GET config** — languages + versions
   - **POST publish** — body `{ "lang": "fr" }`
   - **POST save draft** — example body (edit as needed)
4. Leave **baseUrl** as `http://localhost:8090` or change it in the collection variables.
5. Send any request to test the API.

---

## VS Code REST Client

Open **`api-requests.http`** and click **Send Request** above each block.

---

## curl

```bash
curl http://localhost:8090/api/v1/translations
curl http://localhost:8090/api/v1/config
curl -X POST http://localhost:8090/api/v1/publish -H "Content-Type: application/json" -d "{\"lang\":\"fr\"}"
```
