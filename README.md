# Orthologique 📚✨

**Maîtrisez l'orthographe française par la logique**

Une application web éducative Progressive Web App (PWA) conçue pour aider les apprenants, notamment ceux présentant une dysorthographie, à maîtriser les règles fondamentales de l'orthographe française par la compréhension logique plutôt que par la mémorisation.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)

## 🎯 Objectifs Pédagogiques

- **Démystifier l'orthographe** : Montrer que les règles suivent une logique claire
- **Développer des automatismes** : Apprendre à se poser les bonnes questions
- **Renforcer la confiance** : Environnement bienveillant où l'erreur est formatrice
- **Améliorer durablement** les compétences rédactionnelles

## 👥 Public Cible

**Principal** : Enfants (CM1+), adolescents et adultes avec dysorthographie  
**Secondaire** : Toute personne souhaitant renforcer ses bases en orthographe

## ✨ Fonctionnalités Principales

### 📖 Parcours d'Apprentissage Progressif
- **20 modules complets** : De l'accord sujet-verbe aux temps composés avancés
- **Déblocage séquentiel** : Progression cohérente avec seuil de réussite (70%)
- **Leçons enrichies** : Règle → Explication → Étymologie → Cas particuliers → Exemples littéraires
- **4 niveaux de difficulté** : Débutant (CM1-CM2) → Expert (Lycée)

### 🎮 Exercices Interactifs
- **15 exercices par module** pour une pratique approfondie
- **5 types d'exercices** : QCM, texte à trous, glisser-déposer, transformation, dictée
- **Feedback immédiat** avec explications pédagogiques
- **Système d'indices** automatique après erreur

### 📊 Suivi de Progression
- **Tableau de bord visuel** avec statistiques détaillées
- **Scores et trophées** pour la motivation
- **Sauvegarde locale** de tous les progrès
- **Recommandations personnalisées**

### ♿ Accessibilité Optimisée
- **Design adapté** aux personnes dyslexiques
- **Synthèse vocale** intégrée
- **Contrastes élevés** et police lisible
- **Interface épurée** pour maximiser la concentration

### 📚 Contenu Étendu

#### 📝 Modules Disponibles

**🟢 Niveau Débutant (CM1-CM2)**
- Module 1 : L'accord Sujet-Verbe
- Module 2 : Homophones a / à
- Module 3 : Homophones est / et
- Module 4 : Homophones son / sont
- Module 5 : L'accord dans le Groupe Nominal

**🟡 Niveau Intermédiaire (6e-5e)**
- Module 6 : Pluriels des Noms
- Module 7 : Participe Passé avec Être et Avoir
- Module 8 : Homophones Complexes (ou/où, ce/se, ces/ses)
- Module 9 : Ponctuation dans le Dialogue

**🟠 Niveau Avancé (4e-3e)**
- Module 10 : Conjugaison Présent : Verbes Irréguliers
- Module 11 : Accord du Participe Passé avec COD Avancé
- Module 12 : Mots Invariables Courants
- Module 13 : Terminaisons é/er/ez

**🔴 Niveau Expert (Lycée)**
- Module 14 : Accord de l'Adjectif de Couleur
- Module 15 : Homophones Avancés (on/ont, la/là/l'a)
- Module 16 : Le Subjonctif Présent
- Module 17 : Le Conditionnel : Modes et Temps
- Module 18 : L'Impératif : Ordre et Conseil
- Module 19 : Participe Passé des Verbes Pronominaux
- Module 20 : Temps Composés Avancés

#### 🎯 Nouveaux Types d'Exercices
- **🎯 QCM** : Questions à choix multiples
- **✏️ Texte à trous** : Compléter des phrases
- **🎪 Glisser-déposer** : Interface tactile pour placer les mots
- **🔄 Transformation** : Modifier des phrases selon des consignes
- **🎧 Dictée** : Exercices d'écoute avec synthèse vocale

### 📊 Statistiques
- **300 exercices** au total avec 5 types différents
- **Contenu complet** couvrant du niveau CM1 au Lycée
- **Progression enrichie** avec déblocage séquentiel maintenu
- **Contexte culturel** avec citations littéraires et étymologie

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/ortho-logique.git
cd ortho-logique

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Construire pour la production
npm run build
```

### Déploiement
```bash
# Prévisualiser la build de production
npm run preview
```

## 🏗️ Architecture Technique

### Technologies Utilisées
- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **Audio** : Tone.js + Web Speech API
- **Icons** : Lucide React
- **Build** : Vite
- **Storage** : localStorage (pas de backend)

### Structure du Projet
```
src/
├── components/          # Composants React réutilisables
│   ├── Dashboard.tsx    # Tableau de bord principal
│   ├── LessonView.tsx   # Interface des leçons
│   ├── ExerciseView.tsx # Interface des exercices
│   └── ResultsView.tsx  # Écran de résultats
├── data/
│   └── lessons.json     # Contenu pédagogique
├── types/
│   └── index.ts         # Définitions TypeScript
├── utils/
│   ├── audio.ts         # Gestion audio et synthèse vocale
│   ├── storage.ts       # Sauvegarde localStorage
│   └── progressManager.ts # Logique de progression
└── App.tsx              # Composant principal
```

### Gestion des Données
- **Contenu** : Stocké dans `lessons.json` pour faciliter les mises à jour
- **Progression** : Sauvegardée localement via localStorage
- **Pas de backend** : Application entièrement côté client

## 🎨 Design et UX

### Identité Visuelle
- **Logo** : Ampoule symbolisant la logique et la compréhension
- **Couleurs** : Palette douce et apaisante (bleu principal, vert validation, rouge erreur)
- **Typography** : Open Sans, optimisée pour la dyslexie

### Principes UX
- **Navigation intuitive** avec fil d'Ariane
- **Zéro distraction** pendant l'apprentissage
- **Feedback immédiat** et encourageant
- **Responsive design** (desktop, tablette, mobile)

## 📱 Utilisation

1. **Accueil** : Personnalisez votre profil et consultez vos statistiques
2. **Leçons** : Découvrez les règles avec explications logiques
3. **Exercices** : Pratiquez avec feedback immédiat
4. **Progression** : Débloquez de nouveaux modules en réussissant

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Ajout de Contenu
Pour ajouter de nouvelles leçons, modifiez `src/data/lessons.json` en suivant la structure existante.

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Communauté des personnes dyslexiques pour les retours précieux
- Enseignants spécialisés pour la validation pédagogique
- Contributeurs open source pour les outils utilisés

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/votre-username/ortho-logique/issues)
- **Documentation** : Consultez `NOTICE.md` pour le guide utilisateur
- **Changelog** : Voir `CHANGELOG.md` pour l'historique des versions

---

**OrthoLogique** - Parce que l'orthographe a sa logique ! 🧠✨