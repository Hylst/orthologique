# Structure et Architecture de l'Application Orthologique

## Vue d'ensemble

**Orthologique** est une application web éducative dédiée à l'apprentissage de l'orthographe française par la logique. Elle propose un parcours structuré avec 20 leçons couvrant 300 exercices, ciblant les élèves du CM1 au Lycée.

### Catégorie et Finalité
- **Catégorie** : Application éducative / E-learning
- **Finalité** : Apprentissage interactif de l'orthographe française
- **Public cible** : Élèves du CM1 au Lycée (8-18 ans)
- **Approche pédagogique** : Apprentissage par la logique et la compréhension des règles

## Architecture Technique

### Stack Technologique
- **Frontend** : React 18.3.1 avec TypeScript
- **Build Tool** : Vite 5.4.2
- **Styling** : Tailwind CSS 3.4.1
- **Audio** : Tone.js 15.1.22 pour la synthèse vocale
- **Icons** : Lucide React 0.344.0
- **PWA** : Service Worker intégré

### Structure des Dossiers

```
src/
├── components/          # Composants React réutilisables
│   ├── AuthModal.tsx    # Modal d'authentification
│   ├── Dashboard.tsx    # Tableau de bord principal
│   ├── ExerciseView.tsx # Vue des exercices
│   ├── LessonView.tsx   # Vue des leçons
│   ├── Logo.tsx         # Logo de l'application
│   ├── OfflineIndicator.tsx # Indicateur hors ligne
│   ├── PWAInstallButton.tsx # Bouton d'installation PWA
│   ├── ProfileModal.tsx # Modal de profil utilisateur
│   ├── ProgressBar.tsx  # Barre de progression
│   ├── ResultsView.tsx  # Vue des résultats
│   └── UserMenu.tsx     # Menu utilisateur
├── data/
│   └── lessons.json     # Données des leçons (4247 lignes)
├── types/
│   └── index.ts         # Définitions TypeScript
├── utils/               # Utilitaires
│   ├── audio.ts         # Gestion audio/synthèse vocale
│   ├── notifications.ts # Notifications système
│   ├── progressManager.ts # Gestion de la progression
│   ├── pwa.ts          # Fonctionnalités PWA
│   └── storage.ts      # Stockage local
├── App.tsx             # Composant racine
├── main.tsx           # Point d'entrée
└── index.css          # Styles globaux
```

## Logique Métier

### Gestion de la Progression

La classe `ProgressManager` centralise la logique de progression :
- **Déblocage séquentiel** : Les leçons se débloquent selon les prérequis
- **Score minimum** : 70% requis pour valider une leçon
- **Persistance** : Sauvegarde locale via localStorage
- **Statistiques** : Calcul automatique des moyennes et pourcentages

### Système d'Authentification

- **Mode invité** : Accès limité sans inscription
- **Profils utilisateur** : Sauvegarde personnalisée de la progression
- **Préférences** : Audio, taille de police, thème, notifications

### Types d'Exercices

1. **QCM** : Questions à choix multiples
2. **Fill-in-the-blank** : Textes à trous
3. **Drag-drop** : Glisser-déposer
4. **Transformation** : Modification de phrases
5. **Dictation** : Dictées avec synthèse vocale

## Architecture des Données

### Structure des Leçons

Chaque leçon contient :
- **Métadonnées** : ID, titre, niveau, difficulté, public cible
- **Contenu pédagogique** : Règle, explication, étymologie, mnémotechniques
- **Exemples** : Cas d'usage et exemples littéraires
- **Cas particuliers** : Exceptions et astuces
- **Exercices** : Collection d'exercices variés
- **Prérequis** : Dépendances vers d'autres leçons

### Catégories de Contenu

1. **Orthographe** : Règles d'écriture des mots
2. **Conjugaison** : Accords et temps verbaux
3. **Ponctuation** : Usage des signes de ponctuation
4. **Syntaxe** : Structure des phrases

### Niveaux de Difficulté

1. **Débutant** : CM1-CM2 (vert)
2. **Intermédiaire** : 6e-5e (jaune)
3. **Avancé** : 4e-3e (orange)
4. **Expert** : Lycée (rouge)

## Routage et Navigation

### États de l'Application

L'application utilise un système d'états centralisé :

```typescript
type AppState = {
  currentView: 'dashboard' | 'lesson' | 'exercise' | 'results';
  currentLessonId: string | null;
  currentExerciseIndex: number;
  userProgress: UserProgress;
  lessons: Lesson[];
  isLoading: boolean;
  authState: AuthState;
}
```

### Flux de Navigation

1. **Dashboard** → Sélection de leçon
2. **LessonView** → Étude de la règle
3. **ExerciseView** → Série d'exercices
4. **ResultsView** → Affichage des résultats
5. Retour au **Dashboard** avec progression mise à jour

## Fonctionnalités PWA

### Capacités Hors Ligne
- **Service Worker** : Cache des ressources statiques
- **Stockage local** : Progression sauvegardée localement
- **Indicateur de connexion** : Affichage du statut réseau

### Installation
- **Bouton d'installation** : Prompt d'ajout à l'écran d'accueil
- **Manifest** : Configuration PWA complète
- **Icons** : Icônes adaptatives pour tous les appareils

## Accessibilité et UX

### Fonctionnalités d'Accessibilité
- **Synthèse vocale** : Lecture des textes via Tone.js
- **Contrôle de vitesse** : Ajustement du débit de parole
- **Tailles de police** : Petit, moyen, grand
- **Thèmes** : Clair, sombre, dyslexie

### Design Responsive
- **Mobile-first** : Optimisé pour les appareils mobiles
- **Tailwind CSS** : Classes utilitaires pour un design cohérent
- **Composants modulaires** : Réutilisabilité maximale

## Gestion des Dépendances

### Dépendances Principales
- **React/React-DOM** : Framework UI
- **Tone.js** : Synthèse audio avancée
- **Lucide React** : Bibliothèque d'icônes moderne

### Dépendances de Développement
- **TypeScript** : Typage statique
- **ESLint** : Linting du code
- **Vite** : Build tool rapide
- **Tailwind CSS** : Framework CSS utilitaire

## Relations entre Composants

### Composants Principaux

1. **App.tsx** : Composant racine, gestion d'état global
2. **Dashboard.tsx** : Hub central, liste des leçons
3. **LessonView.tsx** : Affichage du contenu pédagogique
4. **ExerciseView.tsx** : Interface d'exercices interactifs
5. **ResultsView.tsx** : Bilan et feedback

### Composants Utilitaires

1. **ProgressBar.tsx** : Visualisation de la progression
2. **UserMenu.tsx** : Gestion du profil utilisateur
3. **AuthModal.tsx** : Authentification
4. **OfflineIndicator.tsx** : État de la connexion
5. **PWAInstallButton.tsx** : Installation PWA

### Flux de Données

```
App (état global)
├── Dashboard (affichage des leçons)
│   ├── ProgressBar (progression globale)
│   ├── UserMenu (profil utilisateur)
│   └── AuthModal (authentification)
├── LessonView (contenu pédagogique)
├── ExerciseView (exercices interactifs)
└── ResultsView (résultats et feedback)
```

## Performance et Optimisation

### Optimisations Vite
- **Code splitting** : Séparation vendor/audio/icons
- **Tree shaking** : Élimination du code mort
- **Lazy loading** : Chargement à la demande

### Gestion Mémoire
- **React.useMemo** : Mémorisation des calculs coûteux
- **React.useCallback** : Optimisation des callbacks
- **Cleanup** : Nettoyage des effets et listeners

## Sécurité

### Stockage Local
- **Pas de données sensibles** : Seule la progression est stockée
- **Validation côté client** : Vérification des données utilisateur
- **Sanitisation** : Nettoyage des entrées utilisateur

### Content Security Policy
- **Service Worker** : Contrôle des ressources cachées
- **HTTPS** : Recommandé pour la production

Cette architecture modulaire et bien structurée permet une maintenance aisée et une évolutivité optimale de l'application éducative.