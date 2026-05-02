# HelperCron Community

**HelperCron Community** est une application de bureau gratuite développée avec **Angular 19** et **Electron**. Elle combine un constructeur visuel de flux d'automatisation sans code avec un chat IA local via Ollama, un planificateur de type cron, des journaux d'exécution et un calendrier de flux — tout s'exécutant localement sans dépendance obligatoire au cloud.

🌐 [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [中文](README.zh.md)

---

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Stack technique](#stack-technique)
3. [Démarrage rapide](#démarrage-rapide)
4. [Build pour la distribution](#build-pour-la-distribution)
5. [Pages de l'application](#pages-de-lapplication)
6. [Référence des types de blocs](#référence-des-types-de-blocs)
7. [Planificateur de flux](#planificateur-de-flux)
8. [Fournisseurs IA](#fournisseurs-ia)
9. [Stockage des données](#stockage-des-données)
10. [Sécurité](#sécurité)
11. [Internationalisation](#internationalisation)
12. [Structure du projet](#structure-du-projet)

---

## Fonctionnalités

- **Constructeur de flux visuel** — Canvas sans code pour créer des flux d'automatisation à partir de blocs réutilisables
- **Planificateur Cron** — Planifiez des flux à intervalles fixes ou à des heures précises les jours sélectionnés ; s'exécute entièrement en arrière-plan
- **Chat IA** — Discutez localement avec Ollama avec des réponses en streaming en temps réel
- **Gestion des conversations** — Créer, renommer et supprimer des conversations ; les organiser dans des dossiers nommés
- **Journaux d'exécution** — Historique d'exécution par flux avec journaux complets étape par étape, durée et statut
- **Stockage de logs personnalisés** — Les flux peuvent écrire des logs nommés clé-valeur dans SQLite et les consulter ou les supprimer ultérieurement
- **Calendrier de flux** — Calendrier jour/mois/année visualisant les flux planifiés et leurs exécutions passées
- **Thème sombre/clair/système** — Trois modes de thème avec cinq préréglages de couleur d'accentuation
- **7 langues d'interface** — Espagnol, Anglais, Allemand, Français, Portugais, Japonais, Chinois

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework UI | Angular 19 (composants standalone, routes lazy-loaded) |
| Shell bureau | Electron (contextBridge IPC, `contextIsolation: true`) |
| Style | Tailwind CSS 3, `darkMode: 'class'` |
| Base de données | SQLite via `better-sqlite3` (mode WAL) |
| Langage | TypeScript |
| Alertes | `ngx-simpli-alert` |
| Police | Inter (`@fontsource/inter`) |

---

## Démarrage rapide

### Prérequis

- **Node.js** ≥ 18
- **Ollama** *(optionnel)* — à installer depuis [ollama.com](https://ollama.com) pour utiliser des modèles IA locaux

### Installer les dépendances

```bash
npm install
```

> `postinstall` recompile automatiquement les modules natifs (`better-sqlite3`) pour la version d'Electron installée.

### Exécuter en développement

```bash
npm run electron:dev
```

Lance trois processus simultanément :

1. `ng serve` — serveur de développement Angular sur `http://localhost:4200`
2. `tsc --watch` — compilateur TypeScript pour le processus principal Electron
3. `electron` — charge `http://localhost:4200` une fois le serveur prêt

---

## Build pour la distribution

Voir [BUILD.md](BUILD.md) pour les détails complets.

```bash
# Windows (installateur NSIS + portable, x64)
npm run dist:win

# macOS (DMG + ZIP, x64 + arm64) — doit être exécuté sur macOS
npm run dist:mac

# Linux (tar.gz, x64)
npm run dist:linux
```

Les artefacts de build se trouvent dans le répertoire `release/`.

---

## Pages de l'application

### Dashboard

Point d'entrée au démarrage :

- **Cartes de statistiques** — total des flux, flux actifs (planifiés), total des conversations, modèles IA disponibles
- **Exécutions récentes** — dernières exécutions de flux avec statut (succès / erreur)
- **Actions rapides** — raccourcis vers le Constructeur, Chat, Calendrier et Modèles IA

### Constructeur de tâches (Task Builder)

Fonctionnalité principale. Un **canvas visuel** pour construire des flux :

1. Faire glisser les types de blocs depuis la barre latérale gauche sur le canvas
2. Connecter les blocs en faisant glisser les connecteurs de sortie vers les entrées
3. Configurer chaque bloc dans le panneau de droite (clic pour sélectionner)
4. Définir un **planning** (intervalle ou heure précise + jours de la semaine)
5. Cliquer sur **Exécuter** pour une exécution manuelle ou sauvegarder pour que le planificateur le prenne en charge

Capacités du canvas : panoramique (clic molette), zoom (molette), sélection multiple (Shift+clic), menu contextuel clic droit, interpolation `{{varName}}` dans tous les champs de texte.

### Bibliothèque de flux

Parcourir et gérer tous les flux sauvegardés :

- Vue grille ou liste, recherche par nom, options de tri
- Filtre flux planifiés uniquement
- Renommer, dupliquer, supprimer, activer/désactiver les flux
- Exécution rapide d'un flux directement depuis la bibliothèque

### Calendrier de flux

Visualiser les flux planifiés et l'historique d'exécution :

- **Vue jour** — grille horaire avec les exécutions du jour
- **Vue mois** — grille mensuelle avec des points d'exécution par jour
- **Vue année** — carte thermique annuelle de l'activité

Cliquer sur une exécution pour ouvrir le journal complet étape par étape.

### Chat IA (Chatbot)

Chat complet avec Ollama :

- Sélecteur de modèle Ollama local
- Réponses en streaming jeton par jeton
- Gestion des conversations (créer, renommer, supprimer)
- Organisation des conversations en dossiers nommés
- Titres de conversation générés automatiquement après le premier échange

### Modèles IA

Afficher et gérer les modèles Ollama disponibles :

- Liste tous les modèles Ollama disponibles localement
- Vérifier l'état du service Ollama
- Aucune clé API requise — Ollama est détecté automatiquement sur `http://localhost:11434`

### Logs personnalisés

Tableau paginé et consultable des entrées de log écrites par les flux via le bloc **Save Log** :

- Filtre par nom de log, flux et plage de dates
- Modal de détail avec visionneuse JSON brute/tableau
- Supprimer des entrées individuelles ou suppression en masse par filtre

### Paramètres

- **Langue** — basculer entre 7 langues (effet immédiat)
- **Thème** — Clair, Sombre ou Système (suit la préférence du système d'exploitation)
- **Couleur d'accentuation** — Bleu, Vert, Rose, Ambre ou Violet
- **Ollama** — vérifier l'état du service, démarrer/arrêter le démon local

---

## Référence des types de blocs

| Bloc | Catégorie | Description |
|---|---|---|
| `api-rest` | Intégration | Requête HTTP (GET/POST/PUT/DELETE/PATCH). Achemine vers les ports `2xx`, `4xx` ou `5xx` selon le statut de réponse. Supporte en-têtes, body, `outputVar` et mappings de données. |
| `ai-prompt` | IA | Envoie un prompt au modèle Ollama sélectionné ; stocke la réponse texte dans `outputVar`. |
| `local-storage` | Données | Lit ou écrit une clé nommée dans le stockage local persistant. |
| `set-variable` | Variables | Assigne une valeur littérale ou une expression à une variable de flux nommée. |
| `save-log` | Journalisation | Écrit une entrée de log nommée (clé + valeur) dans la table des logs personnalisés. |
| `delete-log` | Journalisation | Supprime les entrées de log correspondant à un filtre de nom, éventuellement limité au flux actuel. |
| `fork` | Contrôle | Divise l'exécution en plusieurs branches parallèles (fan-out). |
| `join` | Contrôle | Attend que toutes les branches entrantes soient terminées avant de continuer (fan-in). |

### Interpolation de variables

Tout champ texte supporte la syntaxe `{{varName}}`. Les variables sont résolues au moment de l'exécution depuis le contexte du flux actuel.

### Mappings de données

Les blocs produisant des résultats objet (`api-rest`, `ai-prompt`) supportent les **mappings de données** : extraire une propriété imbriquée du résultat et la stocker dans une variable nommée pour les blocs en aval.

---

## Planificateur de flux

S'exécute dans le **processus principal Electron** et vérifie toutes les **30 secondes** quels flux activés sont planifiés.

Types de planification :

- **Intervalle** — toutes les N minutes / heures / jours depuis la dernière exécution
- **Heure précise** — à une heure HH:MM configurée les jours sélectionnés (Lun–Dim)

Chaque exécution :

1. Exécute le flux séquentiellement à travers tous les blocs connectés
2. Persiste un journal d'exécution complet étape par étape dans SQLite
3. Affiche une notification bureau du système d'exploitation avec le résultat

L'exécution simultanée du même flux est empêchée.

---

## Fournisseurs IA

| Fournisseur | Authentification |
|---|---|
| Ollama (local) | Aucune — détecté automatiquement sur `http://localhost:11434` |

Toutes les fonctions IA utilisent Ollama en local. Aucune clé API cloud n'est requise ni stockée.

---

## Stockage des données

Toutes les données persistantes sont stockées dans une unique base de données **SQLite** :

```
%APPDATA%\HelperCron\chat.db                        (Windows)
~/Library/Application Support/HelperCron/chat.db    (macOS)
~/.config/HelperCron/chat.db                        (Linux)
```

| Table | Contenu |
|---|---|
| `conversation` | Conversations de chat avec titre et dossier |
| `message` | Messages de chat individuels (rôle, contenu, horodatages) |
| `folder` | Dossiers de conversations |
| `flow` | Flux d'automatisation sauvegardés (JSON canvas, config planning) |
| `execution_log` | Historique d'exécution par flux avec journaux étape par étape et durée |
| `custom_log` | Entrées de log nommées écrites par les flux |
| `user_profile` | Nom d'utilisateur |

Le mode WAL est activé pour les performances d'écriture et la sécurité en cas de panne. Les migrations de schéma s'exécutent automatiquement au démarrage.

---

## Sécurité

- **Isolation de contexte** — `contextIsolation: true`, `nodeIntegration: false` ; le renderer communique exclusivement via le pont `window.agi` dans `preload.ts`
- **Protection path traversal** — `resolveSafePath()` valide et confine toutes les opérations du système de fichiers à la racine de projet configurée
- **Liste blanche de commandes** — l'exécution terminal est limitée à `node`, `npm` et `npx ng` ; les commandes arbitraires sont rejetées
- **Pas d'exposition réseau** — l'application n'ouvre aucun port serveur ; tout l'IPC est local

---

## Internationalisation

Les fichiers de langue sont des maps JSON clé-valeur plates dans :

```
src/assets/i18n/
  es.json   (Espagnol — par défaut)
  en.json   (Anglais)
  de.json   (Allemand)
  fr.json   (Français)
  pt.json   (Portugais)
  ja.json   (Japonais)
  zh.json   (Chinois)
```

La langue active est stockée dans `localStorage` et changée au moment de l'exécution sans rechargement.

---

## Structure du projet

```
helper-cron-community/
├── electron/                  # Processus principal Electron (TypeScript)
│   ├── main.ts                # Point d'entrée, création de fenêtre, enregistrement IPC
│   ├── preload.ts             # contextBridge — expose window.agi au renderer
│   ├── db/                    # Repositories SQLite (better-sqlite3)
│   ├── executor/
│   │   ├── flow.executor.ts   # Parcoureur de graphes de flux et exécuteur de blocs
│   │   └── action.executor.ts # Exécuteur d'actions du système de fichiers
│   ├── ipc/                   # Modules de gestionnaires IPC (un par domaine fonctionnel)
│   ├── scheduler/
│   │   └── flow.scheduler.ts  # Planificateur cron (tick de 30 s)
│   └── security/
│       ├── command-whitelist.ts
│       └── path.utils.ts
├── src/
│   ├── app/
│   │   ├── pages/             # Composants de page lazy-loaded
│   │   │   ├── dashboard/
│   │   │   ├── task-builder/
│   │   │   ├── flow-library/
│   │   │   ├── flow-calendar/
│   │   │   ├── chatbot/
│   │   │   ├── ai-models/
│   │   │   ├── custom-logs/
│   │   │   └── settings/
│   │   ├── core/
│   │   │   ├── components/    # Composants UI partagés
│   │   │   ├── services/      # Services Angular
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   └── pipes/         # TranslatePipe, etc.
│   │   └── shared/
│   └── assets/
│       └── i18n/              # Fichiers JSON de traduction
├── scripts/                   # Scripts d'aide à la construction
├── BUILD.md
└── package.json
```

---

## Exécuter les tests

```bash
ng test
```

Exécute les tests unitaires avec [Karma](https://karma-runner.github.io) + Jasmine dans Chrome Headless.
