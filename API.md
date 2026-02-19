# Backend Wording - Admin API

Base URL : `http://localhost:8090/api`

---

## 1. GET `/api/v1/translations`

Retourne la matrice complète des traductions (publiées + drafts).

**Request :** aucun body

**Response `200` :**
```json
[
  {
    "key": "LOGIN",
    "values": {
      "fr": {
        "TITLE": "Connexion {{name}}",
        "USERNAME": "Nom d'utilisateur",
        "PASSWORD": "Mot de passe",
        "SUBMIT": "Se connecter"
      },
      "en": {
        "TITLE": "Login {{name}}",
        "USERNAME": "Username",
        "PASSWORD": "Password",
        "SUBMIT": "Sign in"
      }
    },
    "isDraft": false
  },
  {
    "key": "HOME",
    "values": {
      "fr": {
        "TITLE": "Accueil",
        "SUBTITLE": "Bienvenue"
      },
      "en": {
        "TITLE": "Home",
        "SUBTITLE": "Welcome"
      }
    },
    "isDraft": true
  }
]
```

> `isDraft: true` → la clé a des modifications non publiées

---

## 2. POST `/api/v1/translations`

Sauvegarde les traductions en brouillon (draft).
Les fichiers JSON publics ne sont **pas modifiés** tant que `/publish` n'est pas appelé.

**Request body :**
```json
{
  "translations": [
    {
      "key": "LOGIN",
      "values": {
        "fr": {
          "TITLE": "Connexion {{name}}",
          "USERNAME": "Nom d'utilisateur",
          "PASSWORD": "Mot de passe",
          "SUBMIT": "Se connecter"
        },
        "en": {
          "TITLE": "Login {{name}}",
          "USERNAME": "Username",
          "PASSWORD": "Password",
          "SUBMIT": "Sign in"
        }
      },
      "isDraft": true
    },
    {
      "key": "HOME",
      "values": {
        "fr": {
          "TITLE": "Accueil",
          "SUBTITLE": "Bienvenue"
        },
        "en": {
          "TITLE": "Home",
          "SUBTITLE": "Welcome"
        }
      },
      "isDraft": true
    }
  ]
}
```

**Response :** `HTTP 200` — pas de body

> **Note :** Si vous envoyez une seule langue, les drafts des autres langues ne sont pas écrasés.

---

## 3. POST `/api/v1/publish`

Publie une langue :
- Fusionne le draft avec la dernière version publiée
- Génère le fichier `{lang}.v{n+1}.json`
- Incrémente la version dans `config.json`
- Supprime le draft

**Request body :**
```json
{
  "lang": "fr"
}
```

**Response `200` :**
```json
{
  "lang": "fr",
  "newVersion": "2",
  "message": "Langue 'fr' publiee en version v2"
}
```

---

## 4. GET `/api/v1/config`

Retourne la configuration globale (langues actives + versions courantes).

**Request :** aucun body

**Response `200` :**
```json
{
  "active_languages": ["fr", "en", "es"],
  "versions": {
    "fr": "2",
    "en": "1",
    "es": "1"
  }
}
```

---

## Flux typique

```
1. Editer les traductions
   POST /api/v1/translations  →  fr.draft.json, en.draft.json

2. Verifier la matrice
   GET  /api/v1/translations  →  isDraft: true sur les cles modifiees

3. Publier langue par langue
   POST /api/v1/publish { "lang": "fr" }  →  fr.v2.json cree, draft supprime
   POST /api/v1/publish { "lang": "en" }  →  en.v2.json cree, draft supprime

4. Verifier la config
   GET  /api/v1/config  →  versions.fr = "2", versions.en = "2"
```

