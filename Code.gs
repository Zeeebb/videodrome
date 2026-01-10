// =====================================================
// VIDEODROME - Google Apps Script
// =====================================================
// 
// INSTRUCTIONS :
// 1. Dans Google Sheets, va dans Extensions > Apps Script
// 2. Supprime tout le code existant et colle celui-ci
// 3. Clique sur "Déployer" > "Gérer les déploiements" > "Modifier" > Nouvelle version > Déployer
// 4. (Si nouveau déploiement: Type "Application Web", Exécuter en tant que "Moi", Accès "Tout le monde")
// =====================================================

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      saveData(data);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } else {
      const data = loadData();
      return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function loadData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const films = [];
  const availabilities = {};
  
  const filmsSheet = ss.getSheetByName('Films');
  if (filmsSheet && filmsSheet.getLastRow() > 1) {
    // Lire les headers pour détecter l'ancien ou nouveau format
    const headerRow = filmsSheet.getRange(1, 1, 1, 17).getValues()[0];
    const hasOldFormat = headerRow.includes('votes') || headerRow.includes('favorites');
    
    const numCols = hasOldFormat ? 17 : 16;
    const data = filmsSheet.getRange(2, 1, filmsSheet.getLastRow() - 1, numCols).getValues();
    
    data.forEach(row => {
      if (row[0]) {
        const film = {
          id: row[0],
          title: row[1],
          year: row[2],
          poster: row[3],
          director: row[4],
          actors: row[5],
          genres: row[6],
          overview: row[7],
          runtime: row[8],
          country: row[9],
          tmdbId: row[10],
          proposedBy: row[11],
          proposedDate: row[12],
          status: row[13]
        };
        
        if (hasOldFormat) {
          // Ancien format: votes (col 15), favorites (col 16), watchedDate (col 17)
          let votes = [];
          let favorites = [];
          try { votes = row[14] ? JSON.parse(row[14]) : []; } catch { votes = []; }
          try { favorites = row[15] ? JSON.parse(row[15]) : []; } catch { favorites = []; }
          // Fusionner votes et favorites en likes (sans doublons)
          film.likes = [...new Set([...votes, ...favorites])];
          film.watchedDate = row[16];
        } else {
          // Nouveau format: likes (col 15), watchedDate (col 16)
          try { film.likes = row[14] ? JSON.parse(row[14]) : []; } catch { film.likes = []; }
          film.watchedDate = row[15];
        }
        
        films.push(film);
      }
    });
  }
  
  const availSheet = ss.getSheetByName('Availabilities');
  if (availSheet && availSheet.getLastRow() > 1) {
    const data = availSheet.getRange(2, 1, availSheet.getLastRow() - 1, 2).getValues();
    data.forEach(row => {
      if (row[0]) {
        try { availabilities[row[0]] = row[1] ? JSON.parse(row[1]) : []; } catch { availabilities[row[0]] = []; }
      }
    });
  }
  
  return { films, availabilities };
}

function saveData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.films) {
    let sheet = ss.getSheetByName('Films');
    
    // Supprimer l'ancienne feuille et en créer une nouvelle avec le bon format
    if (sheet) {
      sheet.clear();
      sheet.getRange(1, 1, 1, 16).setValues([['id', 'title', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate']]);
    } else {
      sheet = ss.insertSheet('Films');
      sheet.appendRow(['id', 'title', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate']);
    }
    
    // Ajouter les films
    if (data.films.length > 0) {
      const rows = data.films.map(film => [
        film.id || '',
        film.title || '',
        film.year || '',
        film.poster || '',
        film.director || '',
        film.actors || '',
        film.genres || '',
        film.overview || '',
        film.runtime || '',
        film.country || '',
        film.tmdbId || '',
        film.proposedBy || '',
        film.proposedDate || '',
        film.status || '',
        JSON.stringify(film.likes || []),
        film.watchedDate || ''
      ]);
      sheet.getRange(2, 1, rows.length, 16).setValues(rows);
    }
  }
  
  if (data.availabilities) {
    let sheet = ss.getSheetByName('Availabilities');
    if (!sheet) {
      sheet = ss.insertSheet('Availabilities');
      sheet.appendRow(['date', 'users']);
    }
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
    Object.entries(data.availabilities).forEach(([date, users]) => {
      sheet.appendRow([date, JSON.stringify(users)]);
    });
  }
}
