# 📼 VIDEODROME — Ciné-Club Série B

Application web pour gérer les votes et la planification de votre ciné-club.

![Design japonais vintage VHS](https://img.shields.io/badge/style-VHS%20vintage-e63946)

## ✨ Fonctionnalités

- 🎬 **Proposer des films** via recherche TMDB
- ⭐ **Voter et mettre en favoris** les propositions  
- 📅 **Calendrier de disponibilités** partagé
- 📊 **Statistiques** par membre
- 🎥 **Historique** des films vus
- 💾 **Synchro Google Sheets** multi-utilisateurs

## 🚀 Installation rapide

### 1. Google Sheets (optionnel, pour le multi-utilisateurs)

1. Crée une nouvelle feuille sur [Google Sheets](https://sheets.google.com)
2. Va dans **Extensions > Apps Script**
3. Supprime tout et colle le contenu de `Code.gs`
4. **Déployer > Nouveau déploiement > Application Web**
5. Exécuter en tant que: **Moi** / Qui a accès: **Tout le monde**
6. Copie l'URL générée

### 2. Configuration

Dans `index.html`, ligne ~47, remplace :
```javascript
const SHEETS_API = 'COLLE_TON_URL_ICI';
```
Par ton URL Google Apps Script.

### 3. Hébergement

**GitHub Pages :**
1. Upload `index.html` et `Code.gs` sur GitHub
2. Settings > Pages > Source: main branch
3. Ton site sera sur `https://tonpseudo.github.io/videodrome`

**Netlify Drop :**
1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse le dossier
3. C'est en ligne !

## 👥 Membres

Les 5 membres du club avec leurs couleurs :
- 🔴 **Seb** (rouge #e63946)
- 🟠 **Bernard** (orange #f4a261)
- 🟡 **Gary** (jaune #e9c46a)
- 🟢 **Benoit** (vert #2a9d8f)
- 🔵 **Arnaud** (bleu #457b9d)

Pour modifier les membres, édite l'objet `MEMBERS` dans le fichier.

## 🎨 Design

- Style vintage japonais / VHS années 80
- Palette : crème (#f5f0e6) et rouge (#e63946)
- Police : Fraunces
- Cassettes VHS 3D avec animation au hover
- Stickers étoiles 12 branches pour les votes
- Bords dentelés style ticket de cinéma

---

**Bon cinéma !** 🎬
