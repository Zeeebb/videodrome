// ==========================================
// VIDEODROME — Ciné-Club Série B
// ==========================================

const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
const TMDB_IMG_SM = 'https://image.tmdb.org/t/p/w185';
const TMDB_IMG_LG = 'https://image.tmdb.org/t/p/w342';

// ⚠️ REMPLACE CETTE URL PAR TON GOOGLE APPS SCRIPT DÉPLOYÉ
const SHEETS_API = 'https://script.google.com/macros/s/AKfycbzzPPdyHwLm1OCJ4mk0FwXijcdpJWsg43nKzvHe1lvxKtLlNXyJtYJTUdRjkXAe5NrSLg/exec';

// ==========================================
// MEMBRES DU CLUB
// ==========================================
const MEMBERS = [
  { id: 'seb', name: 'Seb', color: '#ff2a6d' },
  { id: 'bernard', name: 'Bernard', color: '#05d9e8' },
  { id: 'gary', name: 'Gary', color: '#ffe600' },
  { id: 'benoit', name: 'Benoit', color: '#9d4edd' },
  { id: 'arnaud', name: 'Arnaud', color: '#39ff14' },
];

// ==========================================
// HELPERS
// ==========================================
const getSmallPoster = (url) => url?.replace('/w342/', '/w185/').replace('/w500/', '/w185/').replace('/w300/', '/w185/') || null;
const getLargePoster = (url) => url?.replace('/w185/', '/w342/').replace('/w154/', '/w342/') || null;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const getMember = (id) => MEMBERS.find(m => m.id === id) || { id, name: id, color: '#6a6a7a' };

// ==========================================
// TOAST
// ==========================================
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{message}</div>;
};

// ==========================================
// APP
// ==========================================
const App = () => {
  const [currentUser, setCurrentUser] = React.useState(() => localStorage.getItem('videodrome_user') || 'seb');
  const [tab, setTab] = React.useState('propositions');
  const [films, setFilms] = React.useState(() => {
    const c = localStorage.getItem('videodrome_films');
    return c ? JSON.parse(c) : [];
  });
  const [availabilities, setAvailabilities] = React.useState(() => {
    const c = localStorage.getItem('videodrome_avail');
    return c ? JSON.parse(c) : {};
  });
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('favorites');
  const [selected, setSelected] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { localStorage.setItem('videodrome_user', currentUser); }, [currentUser]);
  React.useEffect(() => { localStorage.setItem('videodrome_films', JSON.stringify(films)); }, [films]);
  React.useEffect(() => { localStorage.setItem('videodrome_avail', JSON.stringify(availabilities)); }, [availabilities]);

  // Load on mount
  React.useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!SHEETS_API || SHEETS_API === 'COLLE_TON_URL_ICI') {
      setLoading(false);
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch(SHEETS_API);
      const data = await res.json();
      if (data.films) {
        setFilms(data.films.map(f => ({
          ...f,
          id: parseInt(f.id) || f.id,
          year: parseInt(f.year) || 0,
          votes: f.votes ? (typeof f.votes === 'string' ? JSON.parse(f.votes) : f.votes) : [],
          favorites: f.favorites ? (typeof f.favorites === 'string' ? JSON.parse(f.favorites) : f.favorites) : [],
        })));
      }
      if (data.availabilities) setAvailabilities(data.availabilities);
      showToast('Données synchronisées');
    } catch(e) { console.error(e); }
    setSyncing(false);
    setLoading(false);
  };

  const saveData = async (newFilms, newAvail) => {
    if (!SHEETS_API || SHEETS_API === 'COLLE_TON_URL_ICI') return;
    setSyncing(true);
    try {
      await fetch(SHEETS_API, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ films: newFilms || films, availabilities: newAvail || availabilities })
      });
    } catch(e) { console.error(e); }
    setSyncing(false);
  };

  const scheduledFilm = films.find(f => f.status === 'scheduled');
  const proposedFilms = films.filter(f => f.status === 'proposed');
  const watchedFilms = films.filter(f => f.status === 'watched').sort((a, b) => new Date(b.watchedDate) - new Date(a.watchedDate));
  const stats = { proposed: proposedFilms.length, watched: watchedFilms.length };

  const filteredFilms = React.useMemo(() => {
    let r = [...proposedFilms];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(f => f.title?.toLowerCase().includes(q) || f.director?.toLowerCase().includes(q));
    }
    switch(sort) {
      case 'favorites': return r.sort((a, b) => (b.favorites?.length || 0) - (a.favorites?.length || 0));
      case 'votes': return r.sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));
      case 'recent': return r.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'year': return r.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'alpha': return r.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fr'));
      default: return r;
    }
  }, [proposedFilms, search, sort]);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const addFilm = (film) => {
    const nf = { ...film, id: Date.now(), proposedBy: currentUser, proposedDate: new Date().toISOString(), status: 'proposed', votes: [], favorites: [] };
    const newFilms = [nf, ...films];
    setFilms(newFilms);
    saveData(newFilms);
    setShowAdd(false);
    showToast(`"${film.title}" ajouté`);
  };

  const toggleVote = (id) => {
    const newFilms = films.map(f => {
      if (f.id !== id) return f;
      const votes = f.votes || [];
      return { ...f, votes: votes.includes(currentUser) ? votes.filter(v => v !== currentUser) : [...votes, currentUser] };
    });
    setFilms(newFilms);
    saveData(newFilms);
    if (selected?.id === id) setSelected(newFilms.find(f => f.id === id));
  };

  const toggleFavorite = (id) => {
    const newFilms = films.map(f => {
      if (f.id !== id) return f;
      const favs = f.favorites || [];
      return { ...f, favorites: favs.includes(currentUser) ? favs.filter(v => v !== currentUser) : [...favs, currentUser] };
    });
    setFilms(newFilms);
    saveData(newFilms);
    if (selected?.id === id) setSelected(newFilms.find(f => f.id === id));
  };

  const scheduleFilm = (id) => {
    const newFilms = films.map(f => ({ ...f, status: f.id === id ? 'scheduled' : (f.status === 'scheduled' ? 'proposed' : f.status) }));
    setFilms(newFilms);
    saveData(newFilms);
    setSelected(null);
    showToast('Film programmé');
  };

  const markWatched = (id, date) => {
    const newFilms = films.map(f => f.id === id ? { ...f, status: 'watched', watchedDate: date || new Date().toISOString() } : f);
    setFilms(newFilms);
    saveData(newFilms);
    setSelected(null);
    showToast('Film marqué comme vu');
  };

  const deleteFilm = (id) => {
    if (!confirm('Supprimer ce film ?')) return;
    const newFilms = films.filter(f => f.id !== id);
    setFilms(newFilms);
    saveData(newFilms);
    setSelected(null);
    showToast('Film supprimé');
  };

  const toggleAvail = (date) => {
    const key = date.toISOString().split('T')[0];
    const cur = availabilities[key] || [];
    const newAvail = { ...availabilities, [key]: cur.includes(currentUser) ? cur.filter(u => u !== currentUser) : [...cur, currentUser] };
    setAvailabilities(newAvail);
    saveData(null, newAvail);
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><div>Chargement...</div></div>;

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <div className="logo">VIDEODROME<span className="logo-sub">Ciné-Club Série B</span></div>
          <div className="header-right">
            <select className="user-select" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
              {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="stats"><b>{stats.proposed}</b> proposés · <b>{stats.watched}</b> vus{syncing && <span className="sync-icon"> ⟳</span>}</div>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'propositions' ? 'active' : ''}`} onClick={() => setTab('propositions')}>
            Propositions {stats.proposed > 0 && <span className="tab-badge">{stats.proposed}</span>}
          </button>
          <button className={`tab ${tab === 'planning' ? 'active' : ''}`} onClick={() => setTab('planning')}>Planning</button>
          <button className={`tab ${tab === 'historique' ? 'active' : ''}`} onClick={() => setTab('historique')}>
            Historique {stats.watched > 0 && <span className="tab-badge">{stats.watched}</span>}
          </button>
          <button className={`tab ${tab === 'membres' ? 'active' : ''}`} onClick={() => setTab('membres')}>Membres</button>
        </div>
      </header>

      {tab === 'propositions' && (
        <>
          <div className="controls">
            <input className="search-box" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="favorites">♥ Favoris</option>
              <option value="votes">Votes</option>
              <option value="recent">Récents</option>
              <option value="year">Année</option>
              <option value="alpha">A → Z</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Proposer</button>
          </div>
          <main className="main">
            {scheduledFilm && (
              <div className="featured" onClick={() => setSelected(scheduledFilm)}>
                <div className="featured-inner">
                  <div className="featured-poster">
                    {scheduledFilm.poster ? <img src={getLargePoster(scheduledFilm.poster)} alt="" /> : <div className="card-noimg">📼</div>}
                  </div>
                  <div className="featured-info">
                    <div className="featured-label">Prochaine séance</div>
                    <div className="featured-title">{scheduledFilm.title}</div>
                    <div className="featured-meta">{scheduledFilm.year} · {scheduledFilm.director}</div>
                    <div className="featured-date">📅 Voir le planning</div>
                  </div>
                </div>
              </div>
            )}
            <div className="section-title">Films proposés ({filteredFilms.length})</div>
            {filteredFilms.length > 0 ? (
              <div className="grid">
                {filteredFilms.map(f => (
                  <FilmCard key={f.id} film={f} currentUser={currentUser} onClick={() => setSelected(f)} onFavorite={() => toggleFavorite(f.id)} />
                ))}
              </div>
            ) : (
              <div className="empty"><div className="empty-icon">📼</div>{search ? 'Aucun film trouvé' : 'Aucun film proposé'}<br/><button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => setShowAdd(true)}>Proposer un film</button></div>
            )}
          </main>
        </>
      )}

      {tab === 'planning' && <main className="main"><PlanningTab availabilities={availabilities} currentUser={currentUser} onToggle={toggleAvail} /></main>}
      
      {tab === 'historique' && (
        <main className="main">
          <div className="section-title">Films vus ({watchedFilms.length})</div>
          {watchedFilms.length > 0 ? watchedFilms.map(f => (
            <div key={f.id} className="history-item" onClick={() => setSelected(f)}>
              <div className="history-poster">{f.poster ? <img src={getSmallPoster(f.poster)} alt="" /> : <div style={{width:50,height:75,background:'var(--bg-light)',display:'flex',alignItems:'center',justifyContent:'center'}}>📼</div>}</div>
              <div className="history-info"><div className="history-title">{f.title}</div><div className="history-meta">{f.year} · {f.director}<br/>Proposé par {getMember(f.proposedBy).name}</div></div>
              <div className="history-date">{formatDate(f.watchedDate)}</div>
            </div>
          )) : <div className="empty"><div className="empty-icon">🎬</div>Aucun film vu</div>}
        </main>
      )}

      {tab === 'membres' && <main className="main"><MembersTab films={films} /></main>}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addFilm} />}
      {selected && <DetailModal film={selected} currentUser={currentUser} onClose={() => setSelected(null)} onVote={() => toggleVote(selected.id)} onFavorite={() => toggleFavorite(selected.id)} onSchedule={() => scheduleFilm(selected.id)} onMarkWatched={(d) => markWatched(selected.id, d)} onDelete={() => deleteFilm(selected.id)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ==========================================
// FILM CARD
// ==========================================
const FilmCard = ({ film, currentUser, onClick, onFavorite }) => {
  const isFav = film.favorites?.includes(currentUser);
  const favCount = film.favorites?.length || 0;
  const voteCount = film.votes?.length || 0;
  const proposer = getMember(film.proposedBy);
  const handleFav = (e) => { e.stopPropagation(); onFavorite(); };

  return (
    <div className={`card ${film.status === 'scheduled' ? 'is-scheduled' : ''}`} onClick={onClick}>
      {film.poster ? <img className="card-poster" src={getSmallPoster(film.poster)} alt="" loading="lazy" /> : <div className="card-noimg">📼</div>}
      <div className="card-proposer" style={{background: proposer.color}}>{proposer.name}</div>
      <button className={`card-fav-btn ${isFav ? 'is-favorite' : ''}`} onClick={handleFav}>{isFav ? '❤️' : '🤍'}</button>
      <div className="card-badges">
        {favCount > 0 && <div className="card-badge favorites">♥ {favCount}</div>}
        {voteCount > 0 && <div className="card-badge votes">▲ {voteCount}</div>}
      </div>
      {film.status === 'scheduled' && <div className="card-badge scheduled" style={{position:'absolute',top:'0.5rem',right:'0.5rem'}}>NEXT</div>}
      <div className="card-overlay"><div className="card-title">{film.title}</div><div className="card-meta">{film.year} · {film.director}</div></div>
    </div>
  );
};

// ==========================================
// DETAIL MODAL
// ==========================================
const DetailModal = ({ film, currentUser, onClose, onVote, onFavorite, onSchedule, onMarkWatched, onDelete }) => {
  const hasVoted = film.votes?.includes(currentUser);
  const isFav = film.favorites?.includes(currentUser);
  const isProposer = film.proposedBy === currentUser;
  const proposer = getMember(film.proposedBy);
  const [showDate, setShowDate] = React.useState(false);
  const [watchDate, setWatchDate] = React.useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div className="modal-title">Détails</div><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className="detail-top">
            <div className="detail-poster">{film.poster ? <img src={getLargePoster(film.poster)} alt="" /> : <div style={{width:100,height:150,background:'var(--bg-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>📼</div>}</div>
            <div className="detail-info">
              <div className="detail-title">{film.title}</div>
              <div className="detail-meta">{film.year} · {film.director}{film.runtime ? ` · ${film.runtime} min` : ''}</div>
              <div className="detail-proposer" style={{background: proposer.color}}>Proposé par {proposer.name}</div>
            </div>
          </div>
          {film.overview && <div className="detail-section"><div className="detail-section-title">Synopsis</div><div className="detail-text">{film.overview}</div></div>}
          {film.genres && <div className="detail-section"><div className="detail-section-title">Genres</div><div className="detail-tags">{film.genres.split(',').map((g,i) => <span key={i} className="tag">{g.trim()}</span>)}</div></div>}
          {film.actors && <div className="detail-section"><div className="detail-section-title">Casting</div><div className="detail-text">{film.actors}</div></div>}
          
          {film.status !== 'watched' && (
            <div className="detail-section">
              <div className="detail-section-title">♥ Favoris ({film.favorites?.length || 0})</div>
              {film.favorites?.length > 0 ? <div className="voters-list">{film.favorites.map(v => <div key={v} className="voter-chip favorite-chip">{getMember(v).name}</div>)}</div> : <div className="detail-text" style={{color:'var(--text-dim)'}}>Aucun favori</div>}
            </div>
          )}
          
          {film.status === 'proposed' && (
            <div className="detail-section">
              <div className="detail-section-title">▲ Votes ({film.votes?.length || 0})</div>
              {film.votes?.length > 0 ? <div className="voters-list">{film.votes.map(v => <div key={v} className="voter-chip">{getMember(v).name}</div>)}</div> : <div className="detail-text" style={{color:'var(--text-dim)'}}>Aucun vote</div>}
            </div>
          )}

          <div className="links">
            {film.tmdbId && <a href={`https://www.themoviedb.org/movie/${film.tmdbId}`} target="_blank" rel="noopener" className="link-btn">TMDB</a>}
            <a href={`https://www.imdb.com/find/?q=${encodeURIComponent(film.title + ' ' + film.year)}`} target="_blank" rel="noopener" className="link-btn">IMDb</a>
            <a href={`https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(film.title)}`} target="_blank" rel="noopener" className="link-btn">JustWatch</a>
          </div>

          {film.tmdbId && film.status !== 'watched' && <Suggestions tmdbId={film.tmdbId} />}

          {showDate && (
            <div className="detail-section">
              <div className="detail-section-title">Date de visionnage</div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <input type="date" value={watchDate} onChange={e => setWatchDate(e.target.value)} style={{padding:'0.5rem',background:'var(--bg)',border:'1px solid var(--border)',color:'var(--text)',fontFamily:'inherit'}} />
                <button className="btn btn-primary" onClick={() => onMarkWatched(watchDate)}>OK</button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-actions">
          {film.status === 'proposed' && (
            <>
              <button className={`btn btn-favorite ${isFav ? 'active' : ''}`} onClick={onFavorite}>{isFav ? '♥ Favori' : '♡ Favori'}</button>
              <button className={`btn btn-vote ${hasVoted ? 'voted' : ''}`} onClick={onVote}>{hasVoted ? '✓ Voté' : '▲ Voter'}</button>
              <button className="btn btn-secondary" onClick={onSchedule}>Programmer</button>
            </>
          )}
          {film.status === 'scheduled' && <button className="btn btn-primary" onClick={() => setShowDate(true)}>Marquer vu</button>}
          {(isProposer || film.status === 'watched') && <button className="btn btn-danger" onClick={onDelete}>Supprimer</button>}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ADD MODAL
// ==========================================
const AddModal = ({ onClose, onAdd }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results?.slice(0, 10) || []);
    } catch(e) { console.error(e); }
    setSearching(false);
  };

  const select = async (r) => {
    try {
      const [det, cred] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${r.id}?api_key=${TMDB_KEY}&language=fr-FR`).then(x => x.json()),
        fetch(`https://api.themoviedb.org/3/movie/${r.id}/credits?api_key=${TMDB_KEY}`).then(x => x.json())
      ]);
      onAdd({
        tmdbId: r.id,
        title: det.title,
        year: det.release_date?.split('-')[0] || '',
        poster: det.poster_path ? TMDB_IMG_SM + det.poster_path : null,
        director: cred.crew?.find(c => c.job === 'Director')?.name || '',
        actors: cred.cast?.slice(0, 4).map(a => a.name).join(', ') || '',
        genres: det.genres?.map(g => g.name).join(', ') || '',
        overview: det.overview || '',
        runtime: det.runtime || 0,
      });
    } catch(e) { console.error(e); }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div className="modal-title">Proposer un film</div><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
            <input className="search-box" placeholder="Titre du film..." value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && search()} autoFocus style={{flex:1}} />
            <button className="btn btn-primary" onClick={search} disabled={searching}>{searching ? '...' : 'Chercher'}</button>
          </div>
          {results.length > 0 && (
            <div className="search-results">
              {results.map(r => (
                <div key={r.id} className="search-result" onClick={() => select(r)}>
                  {r.poster_path ? <img src={TMDB_IMG_SM + r.poster_path} alt="" /> : <div className="result-noimg">?</div>}
                  <div className="result-info"><div className="result-title">{r.title}</div><div className="result-meta">{r.release_date?.split('-')[0] || '?'}{r.vote_average > 0 && ` · ⭐ ${r.vote_average.toFixed(1)}`}</div></div>
                </div>
              ))}
            </div>
          )}
          {searching && <div style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)'}}>Recherche...</div>}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUGGESTIONS
// ==========================================
const Suggestions = ({ tmdbId }) => {
  const [sug, setSug] = React.useState([]);
  React.useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/similar?api_key=${TMDB_KEY}&language=fr-FR`)
      .then(r => r.json()).then(d => setSug(d.results?.slice(0, 6) || [])).catch(() => {});
  }, [tmdbId]);
  if (!sug.length) return null;
  return (
    <div className="suggestions">
      <div className="suggestions-title">Films similaires</div>
      <div className="suggestions-grid">
        {sug.map(s => (
          <a key={s.id} href={`https://www.themoviedb.org/movie/${s.id}`} target="_blank" rel="noopener" className="suggestion-card">
            {s.poster_path ? <img src={TMDB_IMG_SM + s.poster_path} alt="" /> : <div style={{aspectRatio:'2/3',background:'var(--bg-light)',display:'flex',alignItems:'center',justifyContent:'center'}}>?</div>}
            <div className="suggestion-info"><div className="suggestion-title">{s.title}</div><div className="suggestion-year">{s.release_date?.split('-')[0]}</div></div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// PLANNING TAB
// ==========================================
const PlanningTab = ({ availabilities, currentUser, onToggle }) => {
  const [month, setMonth] = React.useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const today = new Date(); today.setHours(0,0,0,0);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = [...Array(offset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const monthName = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const bestDates = Object.entries(availabilities)
    .filter(([d]) => new Date(d) >= today)
    .map(([d, u]) => ({ date: d, users: u, count: u.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div>
      <div className="section-title">Tes disponibilités</div>
      <div className="calendar">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <button className="btn btn-secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button>
          <div style={{fontFamily:'Orbitron',fontSize:'0.9rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em'}}>{monthName}</div>
          <button className="btn btn-secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button>
        </div>
        <div className="calendar-grid">
          {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <div key={d} className="calendar-header">{d}</div>)}
          {days.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />;
            const key = date.toISOString().split('T')[0];
            const members = availabilities[key] || [];
            const isAvail = members.includes(currentUser);
            const isPast = date < today;
            return (
              <div key={key} className={`calendar-day ${isAvail ? 'available' : ''} ${isPast ? 'past' : ''}`} onClick={() => !isPast && onToggle(date)}>
                <div className="calendar-day-num">{date.getDate()}</div>
                {members.length > 0 && <div className="calendar-day-count">{members.length}</div>}
              </div>
            );
          })}
        </div>
        <div className="calendar-legend"><span><div className="legend-dot available" />Tu es dispo</span><span>Chiffre = membres dispos</span></div>
      </div>

      <div style={{marginTop:'2rem'}}>
        <div className="section-title">Meilleures dates</div>
        {bestDates.length > 0 ? bestDates.map(({ date, users }) => (
          <div key={date} className="history-item" style={{marginBottom:'0.5rem'}}>
            <div className="history-date" style={{minWidth:'110px'}}>{formatDate(date)}</div>
            <div className="history-info"><div className="voters-list" style={{marginTop:0}}>{users.map(u => <div key={u} className="voter-chip" style={{background:getMember(u).color+'30'}}>{getMember(u).name}</div>)}</div></div>
            <div style={{fontWeight:600,color:'var(--neon-cyan)',fontFamily:'Orbitron'}}>{users.length}/{MEMBERS.length}</div>
          </div>
        )) : <div className="empty" style={{padding:'2rem'}}>Pas de dispo renseignées</div>}
      </div>
    </div>
  );
};

// ==========================================
// MEMBERS TAB
// ==========================================
const MembersTab = ({ films }) => {
  const getStats = (id) => ({
    proposed: films.filter(f => f.proposedBy === id).length,
    watched: films.filter(f => f.proposedBy === id && f.status === 'watched').length,
    votesReceived: films.filter(f => f.proposedBy === id).reduce((a, f) => a + (f.votes?.length || 0), 0),
    favsReceived: films.filter(f => f.proposedBy === id).reduce((a, f) => a + (f.favorites?.length || 0), 0),
  });

  const watchedFilms = films.filter(f => f.status === 'watched');
  const bestProposer = MEMBERS.map(m => ({ ...m, watched: watchedFilms.filter(f => f.proposedBy === m.id).length })).sort((a, b) => b.watched - a.watched)[0];
  const mostActive = MEMBERS.map(m => ({ ...m, votes: films.filter(f => f.votes?.includes(m.id)).length })).sort((a, b) => b.votes - a.votes)[0];

  return (
    <div>
      <div className="section-title">Statistiques</div>
      <div className="members-grid">
        {MEMBERS.map(m => {
          const s = getStats(m.id);
          return (
            <div key={m.id} className="member-card">
              <div className="member-avatar" style={{background:m.color}}>{m.name[0]}</div>
              <div className="member-name">{m.name}</div>
              <div className="member-stats">{s.proposed} proposé{s.proposed > 1 ? 's' : ''}<br/>{s.watched} vu{s.watched > 1 ? 's' : ''}<br/>{s.favsReceived} ♥ reçus</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:'2rem'}}>
        <div className="section-title">Hall of Fame</div>
        <div style={{display:'grid',gap:'1rem',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
          <div className="member-card"><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🎬</div><div className="member-name">Meilleur goût</div><div className="member-stats" style={{marginTop:'0.5rem'}}>{bestProposer?.watched > 0 ? <><strong style={{color:bestProposer.color}}>{bestProposer.name}</strong><br/>{bestProposer.watched} film{bestProposer.watched > 1 ? 's' : ''} vu{bestProposer.watched > 1 ? 's' : ''}</> : 'Pas de données'}</div></div>
          <div className="member-card"><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>👍</div><div className="member-name">Plus actif</div><div className="member-stats" style={{marginTop:'0.5rem'}}>{mostActive?.votes > 0 ? <><strong style={{color:mostActive.color}}>{mostActive.name}</strong><br/>{mostActive.votes} vote{mostActive.votes > 1 ? 's' : ''}</> : 'Pas de données'}</div></div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// RENDER
// ==========================================
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
