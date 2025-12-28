# 🗳️ Projet DevOps - Application de Vote

Ce projet est une application complète de sondage et de vote, composée d'un backend (API REST) et d'un frontend (Application Web Réactive).

## 📋 Table des Matières
- [Contexte du Projet](#contexte-du-projet)
- [Architecture & Technologies](#architecture--technologies)
- [Prérequis](#prérequis)
- [Installation & Configuration](#installation--configuration)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Lancement du Projet](#lancement-du-projet)
- [Fonctionnalités Implémentées](#fonctionnalités-implémentées)

---

## 🧐 Contexte du Projet
Ce projet a été réalisé dans le cadre du module DevOps. Il s'agit d'une application permettant aux utilisateurs de créer des sondages, de voter et de visualiser les résultats en temps réel.
L'objectif actuel est de fournir une base applicative solide (Fullstack JS) prête à être intégrée dans une chaîne DevOps (Dockerisation, CI/CD, etc.).

---

## 🏗 Architecture & Technologies

Le projet est structuré en deux parties principales :

### 🔙 Backend (`/backend`)
API RESTful construite avec :
*   **Runtime** : Node.js
*   **Langage** : TypeScript
*   **Framework** : Express.js
*   **Base de Données** : PostgreSQL
*   **ORM** : Sequelize (avec `sequelize-typescript`)
*   **Authentification** : JWT (JSON Web Tokens) & Bcrypt
*   **Validation** : Express-Validator
*   **Sécurité** : Helmet, CORS

### 🖥️ Frontend (`/frontend`)
Single Page Application (SPA) construite avec :
*   **Framework** : React 19
*   **Build Tool** : Vite
*   **Langage** : TypeScript
*   **Styling** : TailwindCSS
*   **State Management** : React Query (@tanstack/react-query)
*   **Routing** : React Router DOM v7
*   **Formulaires** : React Hook Form & Zod

---

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :
*   **Node.js** (v20+ recommandé)
*   **npm** (ou yarn/pnpm)
*   **PostgreSQL** (Serveur de base de données en cours d'exécution)

---

## 🚀 Installation & Configuration

### 1. Cloner le projet
```bash
git clone <votre-repo-url>
cd DevOps
```

### 2. Configuration du Backend

Allez dans le dossier backend et installez les dépendances :
```bash
cd backend
npm install
```

**Configuration des variables d'environnement :**
Créez un fichier `.env` à la racine du dossier `backend` (ou à la racine du projet si configuré ainsi, le code cherche `../.env` depuis `src/index.ts`, donc possiblement à la racine du dossier `DevOps`).
*Note : D'après l'analyse du code, le backend cherche le fichier `.env` à la racine du dossier `DevOps` (un niveau au-dessus de `backend`).*

Contenu exemple du fichier `.env` (à placer à la racine `DevOps/`) :
```env
PORT=3000
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devops_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# Authentification (JWT)
JWT_SECRET=votre_secret_super_securise_a_Changer
JWT_EXPIRES_IN=24h
```

**Préparation de la Base de Données :**
1.  Créez la base de données PostgreSQL (ex: `devops_db`) via votre outil préféré (pgAdmin, psql, etc.).
2.  Lancez les migrations pour créer les tables :
    ```bash
    npm run migrate
    ```
3.  Injectez les données de test (Seed) :
    ```bash
    npm run seed
    ```

### 3. Configuration du Frontend

Allez dans le dossier frontend et installez les dépendances :
```bash
cd ../frontend
npm install
```

(Optionnel) Si votre backend ne tourne pas sur `http://localhost:3000/api`, créez un fichier `.env` dans `frontend/` :
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ▶️ Lancement du Projet

Il est recommandé d'utiliser deux terminaux séparés.

**Terminal 1 : Backend**
```bash
cd backend
npm run dev
```
*Le serveur démarrera sur le port 3000. Vous devriez voir "🚀 Serveur démarré..." et "✅ Connexion à la base de données...".*

**Terminal 2 : Frontend**
```bash
cd frontend
npm run dev
```
*Vite lancera l'application, généralement accessible sur `http://localhost:5173`.*

Ouvrez votre navigateur sur **http://localhost:5173** pour utiliser l'application.

---

## ✅ Fonctionnalités Implémentées

Voici un résumé de ce qui a été réalisé techniquement dans le projet :

### Fonctionnalités Utilisateur
*   **Authentification Complète** : Inscription (`/register`) et Connexion (`/login`) sécurisées. (user.user@gmail.com / user1234 - admin@example.com / admin1234)
*   **Tableau de Bord** : Vue personnalisée après connexion.
*   **Sondages (Polls)** :
    *   Création de nouveaux sondages.
    *   Consultation de la liste des sondages disponibles.
    *   Vote sur les sondages.
    *   Visualisation des détails d'un sondage.
*   **Profil** : Gestion du profil utilisateur.

### Qualité & Technique
*   **Structure Robuste** : Séparation claire des responsabilités (MVC au backend, Composants/Pages/Hooks au frontend).
*   **Typage Fort** : Utilisation de TypeScript sur toute la stack pour réduire les bugs.
*   **Gestion des Erreurs** : Middleware global d'erreur sur le backend.
*   **Sécurité** : Hachage des mots de passe (Bcrypt), Headers de sécurité (Helmet), Protection CORS.
*   **UX/UI** : Interface moderne et réactive grâce à TailwindCSS et React Query (états de chargement, cache).
