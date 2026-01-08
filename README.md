# 📼 VIDEODROME — Ciné-Club Série B

Application web pour gérer les votes et la planification de votre ciné-club.

## Fonctionnalités

- 🎬 **Proposer des films** via recherche TMDB
- ⭐ **Voter et mettre en favoris** les propositions
- 📅 **Calendrier de disponibilités** partagé
- 📊 **Statistiques** par membre
- 🎥 **Historique** des films vus
- 💾 **Synchro Google Sheets** multi-utilisateurs

## Installation

### Étape 1 : Google Sheets (backend)

1. Crée une nouvelle feuille sur [Google Sheets](https://sheets.google.com)
2. Va dans **Extensions > Apps Script**
3. **Supprime tout le code** existant
4. **Copie-colle le contenu de `Code.gs`**
5. Clique sur **Déployer > Nouveau déploiement**
6. Paramètres :
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
7. Clique **Déployer** et **autorise l'accès**
8. **Copie l'URL** affichée (elle ressemble à `https://script.google.com/macros/s/ABC.../exec`)

### Étape 2 : Configurer l'app

1. Ouvre **`app.js`** dans un éditeur de texte
2. Ligne 9, remplace :
   ```javascript
   const SHEETS_API = 'COLLE_TON_URL_ICI';
   ```
   par ton URL copiée :
   ```javascript
   const SHEETS_API = 'https://script.google.com/macros/s/ABC123xyz.../exec';
   ```
3. Sauvegarde

### Étape 3 : Mettre en ligne

**Option A - GitHub Pages (gratuit) :**
1. Crée un repo sur GitHub
2. Upload les 3 fichiers : `index.html`, `app.js`, `manifest.json`
3. Settings > Pages > Source: main branch
4. Ton site sera sur `https://tonpseudo.github.io/videodrome`

**Option B - Netlify Drop (le plus simple) :**
1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse le dossier dedans
3. C'est en ligne !

---

## Fichiers

| Fichier | Description |
|---------|-------------|
| `index.html` | Page web avec styles |
| `app.js` | Code React (TMDB + Google Sheets) |
| `manifest.json` | Config PWA |
| `Code.gs` | À copier dans Google Apps Script |

---

## Membres

Les 5 membres du club avec leurs couleurs :
- **Seb** (rouge)
- **Bernard** (orange) 
- **Gary** (jaune)
- **Benoit** (vert)
- **Arnaud** (bleu)

Pour modifier les membres, édite le tableau `MEMBERS` dans `app.js`.

---

## Design

- Style vintage japonais / VHS 80s
- Palette : crème (#f5f0e6) et rouge (#e63946)
- Police : Fraunces
- Cassettes VHS 3D avec animation au hover
- Stickers étoiles 12 branches pour les votes

---

**Bon cinéma !** 🎬
