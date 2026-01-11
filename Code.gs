// =====================================================
// VIDEODROME - Google Apps Script v2 (Opérations Atomiques)
// =====================================================
// 
// INSTRUCTIONS :
// 1. Dans Google Sheets, va dans Extensions > Apps Script
// 2. Supprime tout le code existant et colle celui-ci
// 3. Clique sur "Déployer" > "Nouveau déploiement"
// 4. Type "Application Web", Exécuter en tant que "Moi", Accès "Tout le monde"
// 5. Copie l'URL et colle-la dans index.html (SHEETS_API)
//
// IMPORTANT: Si tu mets à jour le code, fais un NOUVEAU déploiement
// (pas juste "modifier"), sinon les changements ne seront pas pris en compte.
// =====================================================

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return jsonResponse({ error: 'Server busy, please retry' });
  }
  
  try {
    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      const action = data.action || 'saveAll';
      
      switch(action) {
        case 'addFilm':
          return jsonResponse(addFilm(data.film));
        case 'deleteFilm':
          return jsonResponse(deleteFilm(data.filmId));
        case 'updateFilm':
          return jsonResponse(updateFilm(data.film));
        case 'addLike':
          return jsonResponse(addLike(data.filmId, data.user));
        case 'removeLike':
          return jsonResponse(removeLike(data.filmId, data.user));
        case 'setAvailability':
          return jsonResponse(setAvailability(data.date, data.user, data.available));
        case 'scheduleFilm':
          return jsonResponse(scheduleFilm(data.filmId));
        case 'unscheduleFilm':
          return jsonResponse(unscheduleFilm(data.filmId));
        case 'markWatched':
          return jsonResponse(markWatched(data.filmId, data.date));
        case 'updatePoster':
          return jsonResponse(updatePoster(data.filmId, data.poster));
        case 'saveAll':
          saveData(data);
          return jsonResponse({ success: true });
        default:
          return jsonResponse({ error: 'Unknown action: ' + action });
      }
    } else {
      return jsonResponse(loadData());
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// =====================================================
// OPÉRATIONS ATOMIQUES SUR LES FILMS
// =====================================================

function addFilm(film) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getOrCreateFilmsSheet(ss);
  
  if (!film.id) film.id = Date.now();
  
  const row = [
    film.id,
    film.title || '',
    film.originalTitle || '',
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
    film.proposedDate || new Date().toISOString().split('T')[0],
    film.status || 'proposed',
    JSON.stringify(film.likes || []),
    film.watchedDate || ''
  ];
  
  sheet.appendRow(row);
  return { success: true, film: film };
}

function deleteFilm(filmId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Film not found' };
}

function updateFilm(film) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(film.id)) {
      const row = [
        film.id,
        film.title || '',
        film.originalTitle || '',
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
        film.status || 'proposed',
        JSON.stringify(film.likes || []),
        film.watchedDate || ''
      ];
      sheet.getRange(i + 1, 1, 1, 17).setValues([row]);
      return { success: true };
    }
  }
  return { success: false, error: 'Film not found' };
}

function addLike(filmId, user) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      let likes = [];
      try { likes = data[i][15] ? JSON.parse(data[i][15]) : []; } catch { likes = []; }
      
      if (!likes.includes(user)) {
        likes.push(user);
        sheet.getRange(i + 1, 16).setValue(JSON.stringify(likes));
      }
      return { success: true, likes: likes };
    }
  }
  return { success: false, error: 'Film not found' };
}

function removeLike(filmId, user) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      let likes = [];
      try { likes = data[i][15] ? JSON.parse(data[i][15]) : []; } catch { likes = []; }
      
      likes = likes.filter(l => l !== user);
      sheet.getRange(i + 1, 16).setValue(JSON.stringify(likes));
      return { success: true, likes: likes };
    }
  }
  return { success: false, error: 'Film not found' };
}

function scheduleFilm(filmId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  
  // D'abord, retirer scheduled de tous les films
  for (let i = 1; i < data.length; i++) {
    if (data[i][14] === 'scheduled') {
      sheet.getRange(i + 1, 15).setValue('proposed');
    }
  }
  
  // Puis mettre le film sélectionné en scheduled
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      sheet.getRange(i + 1, 15).setValue('scheduled');
      return { success: true };
    }
  }
  return { success: false, error: 'Film not found' };
}

function unscheduleFilm(filmId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      sheet.getRange(i + 1, 15).setValue('proposed');
      return { success: true };
    }
  }
  return { success: false, error: 'Film not found' };
}

function markWatched(filmId, date) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      sheet.getRange(i + 1, 15).setValue('watched');
      sheet.getRange(i + 1, 17).setValue(date || new Date().toISOString().split('T')[0]);
      return { success: true };
    }
  }
  return { success: false, error: 'Film not found' };
}

function updatePoster(filmId, poster) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Films');
  if (!sheet) return { success: false, error: 'No Films sheet' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(filmId)) {
      sheet.getRange(i + 1, 5).setValue(poster);
      return { success: true };
    }
  }
  return { success: false, error: 'Film not found' };
}

// =====================================================
// OPÉRATIONS ATOMIQUES SUR LES DISPONIBILITÉS
// =====================================================

function setAvailability(date, user, available) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Availabilities');
  
  if (!sheet) {
    sheet = ss.insertSheet('Availabilities');
    sheet.appendRow(['date', 'users']);
  }
  
  // Helper pour convertir une date en string YYYY-MM-DD
  const toDateStr = (d) => {
    if (d instanceof Date) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    if (typeof d === 'string') {
      // Format "Tue Jan 27 2026" -> YYYY-MM-DD
      if (d.match(/^[A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4}/)) {
        const parsed = new Date(d);
        if (!isNaN(parsed)) {
          return parsed.getFullYear() + '-' + String(parsed.getMonth() + 1).padStart(2, '0') + '-' + String(parsed.getDate()).padStart(2, '0');
        }
      }
    }
    return String(d);
  };
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const rowDate = toDateStr(data[i][0]);
    if (rowDate === date) {
      let users = [];
      try { users = data[i][1] ? JSON.parse(data[i][1]) : []; } catch { users = []; }
      
      if (available && !users.includes(user)) {
        users.push(user);
      } else if (!available) {
        users = users.filter(u => u !== user);
      }
      
      if (users.length > 0) {
        sheet.getRange(i + 1, 2).setValue(JSON.stringify(users));
      } else {
        sheet.deleteRow(i + 1);
      }
      return { success: true, users: users };
    }
  }
  
  // Date pas trouvée, ajouter si available
  if (available) {
    sheet.appendRow([date, JSON.stringify([user])]);
    return { success: true, users: [user] };
  }
  
  return { success: true, users: [] };
}

// =====================================================
// CHARGEMENT / SAUVEGARDE COMPLÈTE
// =====================================================

function getOrCreateFilmsSheet(ss) {
  let sheet = ss.getSheetByName('Films');
  if (!sheet) {
    sheet = ss.insertSheet('Films');
    sheet.appendRow(['id', 'title', 'originalTitle', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate']);
  }
  return sheet;
}

function loadData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const films = [];
  const availabilities = {};
  
  const filmsSheet = ss.getSheetByName('Films');
  if (filmsSheet && filmsSheet.getLastRow() > 1) {
    const headerRow = filmsSheet.getRange(1, 1, 1, 17).getValues()[0];
    const hasOldFormat = headerRow.includes('votes') || headerRow.includes('favorites');
    const hasOriginalTitle = headerRow.includes('originalTitle');
    
    const numCols = hasOriginalTitle ? 17 : (hasOldFormat ? 17 : 16);
    const data = filmsSheet.getRange(2, 1, filmsSheet.getLastRow() - 1, numCols).getValues();
    
    data.forEach(row => {
      if (row[0]) {
        let film;
        
        if (hasOriginalTitle) {
          film = {
            id: row[0],
            title: row[1],
            originalTitle: row[2],
            year: row[3],
            poster: row[4],
            director: row[5],
            actors: row[6],
            genres: row[7],
            overview: row[8],
            runtime: row[9],
            country: row[10],
            tmdbId: row[11],
            proposedBy: row[12],
            proposedDate: row[13],
            status: row[14]
          };
          try { film.likes = row[15] ? JSON.parse(row[15]) : []; } catch { film.likes = []; }
          film.watchedDate = row[16];
        } else if (hasOldFormat) {
          film = {
            id: row[0],
            title: row[1],
            originalTitle: '',
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
          let votes = [], favorites = [];
          try { votes = row[14] ? JSON.parse(row[14]) : []; } catch { votes = []; }
          try { favorites = row[15] ? JSON.parse(row[15]) : []; } catch { favorites = []; }
          film.likes = [...new Set([...votes, ...favorites])];
          film.watchedDate = row[16];
        } else {
          film = {
            id: row[0],
            title: row[1],
            originalTitle: '',
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
        // Convertir la date en string YYYY-MM-DD (Google Sheets peut renvoyer différents formats)
        let dateKey = row[0];
        if (row[0] instanceof Date) {
          dateKey = row[0].getFullYear() + '-' + String(row[0].getMonth() + 1).padStart(2, '0') + '-' + String(row[0].getDate()).padStart(2, '0');
        } else if (typeof row[0] === 'string') {
          // Format "Tue Jan 27 2026" -> YYYY-MM-DD
          if (row[0].match(/^[A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4}/)) {
            const d = new Date(row[0]);
            if (!isNaN(d)) {
              dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            }
          }
          // Format DD/MM/YYYY -> YYYY-MM-DD
          else if (row[0].includes('/')) {
            const parts = row[0].split('/');
            dateKey = parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
          }
          // Sinon garder tel quel (déjà YYYY-MM-DD)
        }
        try { availabilities[dateKey] = row[1] ? JSON.parse(row[1]) : []; } catch { availabilities[dateKey] = []; }
      }
    });
  }
  
  return { films, availabilities };
}

// Rétrocompatibilité
function saveData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.films) {
    let sheet = ss.getSheetByName('Films');
    
    if (sheet) {
      sheet.clear();
      sheet.getRange(1, 1, 1, 17).setValues([['id', 'title', 'originalTitle', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate']]);
    } else {
      sheet = ss.insertSheet('Films');
      sheet.appendRow(['id', 'title', 'originalTitle', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate']);
    }
    
    if (data.films.length > 0) {
      const rows = data.films.map(film => [
        film.id || '',
        film.title || '',
        film.originalTitle || '',
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
      sheet.getRange(2, 1, rows.length, 17).setValues(rows);
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
