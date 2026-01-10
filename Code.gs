// =====================================================
// VIDEODROME - Google Apps Script
// =====================================================
// 
// INSTRUCTIONS :
// 1. Dans Google Sheets, va dans Extensions > Apps Script
// 2. Supprime tout le code existant et colle celui-ci
// 3. Clique sur "Déployer" > "Nouveau déploiement"
// 4. Type: "Application Web"
// 5. Exécuter en tant que: "Moi"
// 6. Qui a accès: "Tout le monde"
// 7. Clique "Déployer" et autorise
// 8. Copie l'URL et colle-la dans index.html (ligne avec SHEETS_API)
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
    const data = filmsSheet.getRange(2, 1, filmsSheet.getLastRow() - 1, 16).getValues();
    const headers = ['id', 'title', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate'];
    data.forEach(row => {
      if (row[0]) {
        const film = {};
        headers.forEach((h, i) => {
          if (h === 'likes') {
            try { film[h] = row[i] ? JSON.parse(row[i]) : []; } catch { film[h] = []; }
          } else { film[h] = row[i]; }
        });
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
    if (!sheet) {
      sheet = ss.insertSheet('Films');
      sheet.appendRow(['id', 'title', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate']);
    }
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
    const headers = ['id', 'title', 'year', 'poster', 'director', 'actors', 'genres', 'overview', 'runtime', 'country', 'tmdbId', 'proposedBy', 'proposedDate', 'status', 'likes', 'watchedDate'];
    data.films.forEach(film => {
      const row = headers.map(h => h === 'likes' ? JSON.stringify(film[h] || []) : (film[h] || ''));
      sheet.appendRow(row);
    });
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
