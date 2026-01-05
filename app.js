// ==========================================
// VIDEODROME — Ciné-Club Série B
// ==========================================

const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';

// ⚠️ REMPLACE PAR TON URL GOOGLE APPS SCRIPT
const SHEETS_API = 'https://script.google.com/macros/s/AKfycby80XFzghKfU7T0d5fiaEKwzdcsF8jg05pZVvy8CdiYPSyt4IcRBO_BbsrY4SIi0d7sWQ/exec';

const MEMBERS = [
  { id: 'seb', name: 'Seb', color: '#39ff14' },
  { id: 'bernard', name: 'Bernard', color: '#ff0040' },
  { id: 'gary', name: 'Gary', color: '#ffff00' },
  { id: 'benoit', name: 'Benoit', color: '#00ffff' },
  { id: 'arnaud', name: 'Arnaud', color: '#ff00ff' },
];

const getMember = (id) => MEMBERS.find(m => m.id === id) || { id, name: id, color: '#666' };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`}>{message}</div>;
};

const App = () => {
  const [user, setUser] = React.useState(() => localStorage.getItem('vd_user') || 'seb');
  const [tab, setTab] = React.useState('propositions');
  const [films, setFilms] = React.useState(() => { try { return JSON.parse(localStorage.getItem('videodrome_films')) || []; } catch { return []; } });
  const [avail, setAvail] = React.useState(() => { try { return JSON.parse(localStorage.getItem('videodrome_availabilities')) || {}; } catch { return {}; } });
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('favorites');
  const [selected, setSelected] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { localStorage.setItem('videodrome_user', user); }, [user]);
  React.useEffect(() => { localStorage.setItem('videodrome_films', JSON.stringify(films)); }, [films]);
  React.useEffect(() => { localStorage.setItem('videodrome_availabilities', JSON.stringify(avail)); }, [avail]);
  React.useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!SHEETS_API || SHEETS_API === 'COLLE_TON_URL_ICI') { setLoading(false); return; }
    setSyncing(true);
    try {
      const res = await fetch(SHEETS_API);
      const data = await res.json();
      if (data.films) setFilms(data.films.map(f => ({ ...f, id: parseInt(f.id) || f.id, year: parseInt(f.year) || 0, votes: f.votes ? (typeof f.votes === 'string' ? JSON.parse(f.votes) : f.votes) : [], favorites: f.favorites ? (typeof f.favorites === 'string' ? JSON.parse(f.favorites) : f.favorites) : [] })));
      if (data.availabilities) setAvail(data.availabilities);
      notify('Synchro OK');
    } catch(e) { console.error(e); }
    setSyncing(false);
    setLoading(false);
  };

  const save = async (f, a) => {
    if (!SHEETS_API || SHEETS_API === 'COLLE_TON_URL_ICI') {
      console.log('Mode local uniquement - pas de Google Sheets configuré');
      return;
    }
    setSyncing(true);
    try { 
      const response = await fetch(SHEETS_API, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({ films: f || films, availabilities: a || avail }) 
      });
      const result = await response.json();
      if (result.success) {
        console.log('Sauvegarde OK');
      } else {
        console.error('Erreur sauvegarde:', result);
        notify('Erreur sauvegarde', 'error');
      }
    } catch(e) { 
      console.error('Erreur réseau:', e); 
      notify('Erreur synchro', 'error');
    }
    setSyncing(false);
  };

  const scheduled = films.find(f => f.status === 'scheduled');
  const proposed = films.filter(f => f.status === 'proposed');
  const watched = films.filter(f => f.status === 'watched').sort((a, b) => new Date(b.watchedDate) - new Date(a.watchedDate));

  const filtered = React.useMemo(() => {
    let r = [...proposed];
    if (search) { const q = search.toLowerCase(); r = r.filter(f => f.title?.toLowerCase().includes(q) || f.director?.toLowerCase().includes(q)); }
    switch(sort) {
      case 'favorites': return r.sort((a, b) => (b.favorites?.length || 0) - (a.favorites?.length || 0));
      case 'votes': return r.sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));
      case 'recent': return r.sort((a, b) => b.id - a.id);
      case 'year': return r.sort((a, b) => b.year - a.year);
      case 'alpha': return r.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fr'));
      default: return r;
    }
  }, [proposed, search, sort]);

  const notify = (msg, type = 'success') => setToast({ message: msg, type });

  const add = (film) => {
    const nf = { ...film, id: Date.now(), proposedBy: user, proposedDate: new Date().toISOString(), status: 'proposed', votes: [], favorites: [] };
    const newFilms = [nf, ...films];
    setFilms(newFilms); save(newFilms); setShowAdd(false);
    notify(`${film.title} ajouté`);
  };

  const vote = (id) => {
    const newFilms = films.map(f => f.id !== id ? f : { ...f, votes: (f.votes || []).includes(user) ? f.votes.filter(v => v !== user) : [...(f.votes || []), user] });
    setFilms(newFilms); save(newFilms);
    if (selected?.id === id) setSelected(newFilms.find(f => f.id === id));
  };

  const fav = (id) => {
    const newFilms = films.map(f => f.id !== id ? f : { ...f, favorites: (f.favorites || []).includes(user) ? f.favorites.filter(v => v !== user) : [...(f.favorites || []), user] });
    setFilms(newFilms); save(newFilms);
    if (selected?.id === id) setSelected(newFilms.find(f => f.id === id));
  };

  const schedule = (id) => {
    const newFilms = films.map(f => ({ ...f, status: f.id === id ? 'scheduled' : (f.status === 'scheduled' ? 'proposed' : f.status) }));
    setFilms(newFilms); save(newFilms); setSelected(null);
    notify('Film programmé');
  };

  const unschedule = (id) => {
    const newFilms = films.map(f => f.id === id ? { ...f, status: 'proposed' } : f);
    setFilms(newFilms); save(newFilms); setSelected(null);
    notify('Film déprogrammé');
  };

  const markWatched = (id, date) => {
    const newFilms = films.map(f => f.id === id ? { ...f, status: 'watched', watchedDate: date || new Date().toISOString() } : f);
    setFilms(newFilms); save(newFilms); setSelected(null);
    notify('Film vu !');
  };

  const del = (id) => {
    if (!confirm('Supprimer ?')) return;
    const newFilms = films.filter(f => f.id !== id);
    setFilms(newFilms); save(newFilms); setSelected(null);
    notify('Supprimé');
  };

  const toggleAvail = (date) => {
    const k = date.toISOString().split('T')[0];
    const cur = avail[k] || [];
    const newAvail = { ...avail, [k]: cur.includes(user) ? cur.filter(u => u !== user) : [...cur, user] };
    setAvail(newAvail); save(null, newAvail);
  };

  if (loading) return <div className="loading-screen"><div className="loading-logo">The Videodrome Club</div></div>;

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <div className="logo">
            <span className="logo-the">the</span>
            <span className="logo-main">Videodrome</span>
            <span className="logo-club">Club</span>
          </div>
          <div className="header-right">
            <select className="user-select" value={user} onChange={e => setUser(e.target.value)}>
              {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="stats">{proposed.length} films · {watched.length} vus{syncing && <span className="sync-icon"> ⟳</span>}</div>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'propositions' ? 'active' : ''}`} onClick={() => setTab('propositions')}>Propositions{proposed.length > 0 && <span className="tab-badge">{proposed.length}</span>}</button>
          <button className={`tab ${tab === 'planning' ? 'active' : ''}`} onClick={() => setTab('planning')}>Planning</button>
          <button className={`tab ${tab === 'historique' ? 'active' : ''}`} onClick={() => setTab('historique')}>Historique{watched.length > 0 && <span className="tab-badge">{watched.length}</span>}</button>
          <button className={`tab ${tab === 'membres' ? 'active' : ''}`} onClick={() => setTab('membres')}>Membres</button>
        </div>
      </header>

      {tab === 'propositions' && (
        <>
          <div className="controls">
            <input className="search-box" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="favorites">♥ Favoris</option>
              <option value="votes">▲ Votes</option>
              <option value="recent">Récents</option>
              <option value="year">Année</option>
              <option value="alpha">A-Z</option>
            </select>
            <button className="btn" onClick={() => setShowAdd(true)}>+ Proposer</button>
          </div>
          <main className="main">
            {scheduled && (
              <div className="featured" onClick={() => setSelected(scheduled)}>
                <div className="featured-label">▶ Prochain film</div>
                <div className="featured-inner">
                  <div className="featured-poster">
                    {scheduled.poster ? <img src={scheduled.poster} alt="" /> : <div className="vhs-noimg">📼</div>}
                  </div>
                  <div className="featured-info">
                    <div className="featured-title">{scheduled.title}</div>
                    <div className="featured-meta">{scheduled.year} · {scheduled.director}</div>
                    <div className="featured-proposer">{getMember(scheduled.proposedBy).name}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="section-title">À voter ({filtered.length})</div>
            {filtered.length > 0 ? (
              <div className="vhs-grid">
                {filtered.map(f => <VHSCard key={f.id} film={f} user={user} onClick={() => setSelected(f)} onFav={() => fav(f.id)} />)}
              </div>
            ) : <div className="empty">Aucun film proposé<br/><button className="btn" style={{marginTop:'1rem'}} onClick={() => setShowAdd(true)}>Proposer</button></div>}
          </main>
        </>
      )}

      {tab === 'planning' && <main className="main"><Planning avail={avail} user={user} onToggle={toggleAvail} /></main>}

      {tab === 'historique' && (
        <main className="main">
          <div className="section-title">Vus ensemble ({watched.length})</div>
          {watched.length > 0 ? watched.map(f => (
            <div key={f.id} className="history-item" onClick={() => setSelected(f)}>
              <div className="history-poster">{f.poster ? <img src={f.poster} alt="" /> : <div style={{width:50,height:75,background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center'}}>📼</div>}</div>
              <div className="history-info"><div className="history-title">{f.title}</div><div className="history-meta">{f.year} · {f.director}</div></div>
              <div className="history-date">{formatDate(f.watchedDate)}</div>
            </div>
          )) : <div className="empty">Aucun film vu</div>}
        </main>
      )}

      {tab === 'membres' && <main className="main"><MembersTab films={films} /></main>}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={add} />}
      {selected && <Detail film={selected} user={user} onClose={() => setSelected(null)} onVote={() => vote(selected.id)} onFav={() => fav(selected.id)} onSchedule={() => schedule(selected.id)} onUnschedule={() => unschedule(selected.id)} onWatched={(d) => markWatched(selected.id, d)} onDelete={() => del(selected.id)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const VHSCard = ({ film, user, onClick, onFav }) => {
  const isFav = film.favorites?.includes(user);
  const favCount = film.favorites?.length || 0;
  const voteCount = film.votes?.length || 0;
  const p = getMember(film.proposedBy);
  return (
    <div className="vhs-case" onClick={onClick}>
      <div className="vhs-wrapper">
        <div className="vhs-sleeve">
          <div className="vhs-sleeve-title">{film.title}</div>
          <div className="vhs-proposer" style={{background: p.color}}></div>
          <div className="vhs-badges">
            {favCount > 0 && <div className="vhs-badge fav">♥{favCount}</div>}
            {voteCount > 0 && <div className="vhs-badge vote">{voteCount}</div>}
          </div>
          <div className="vhs-poster">
            {film.poster ? <img src={film.poster} alt="" loading="lazy" /> : <div className="vhs-noimg">📼</div>}
          </div>
          <button className={`vhs-fav-btn ${isFav ? 'active' : ''}`} onClick={e => { e.stopPropagation(); onFav(); }}>{isFav ? '♥' : '♡'}</button>
          <div className="vhs-sleeve-info">
            <div className="vhs-sleeve-label">{film.title}</div>
            <div className="vhs-sleeve-year">{film.year}</div>
          </div>
        </div>
        <div className="vhs-tape">
          <div className="vhs-tape-label"><span>{film.title}</span></div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ film, user, onClose, onVote, onFav, onSchedule, onUnschedule, onWatched, onDelete }) => {
  const voted = film.votes?.includes(user);
  const faved = film.favorites?.includes(user);
  const isProposer = film.proposedBy === user;
  const p = getMember(film.proposedBy);
  const [showDate, setShowDate] = React.useState(false);
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div className="modal-title">Détails</div><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className="detail-top">
            <div className="detail-poster">{film.poster ? <img src={film.poster} alt="" /> : <div style={{width:120,height:180,background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>📼</div>}</div>
            <div className="detail-info">
              <div className="detail-title">{film.title}</div>
              <div className="detail-meta">{film.year} · {film.director}{film.runtime ? ` · ${film.runtime}min` : ''}</div>
              <div className="detail-proposer" style={{background: p.color}}>{p.name}</div>
            </div>
          </div>
          {film.overview && <div className="detail-section"><div className="detail-section-title">Synopsis</div><div className="detail-text">{film.overview}</div></div>}
          {film.genres && <div className="detail-section"><div className="detail-section-title">Genres</div><div className="tags">{film.genres.split(',').map((g,i) => <span key={i} className="tag">{g.trim()}</span>)}</div></div>}
          {film.actors && <div className="detail-section"><div className="detail-section-title">Casting</div><div className="detail-text">{film.actors}</div></div>}
          {film.status !== 'watched' && (
            <>
              <div className="detail-section"><div className="detail-section-title">♥ Favoris ({film.favorites?.length || 0})</div>{film.favorites?.length > 0 ? <div className="voters-list">{film.favorites.map(v => <div key={v} className="voter-chip fav">{getMember(v).name}</div>)}</div> : <div className="detail-text" style={{color:'#555'}}>—</div>}</div>
              <div className="detail-section"><div className="detail-section-title">▲ Votes ({film.votes?.length || 0})</div>{film.votes?.length > 0 ? <div className="voters-list">{film.votes.map(v => <div key={v} className="voter-chip vote">{getMember(v).name}</div>)}</div> : <div className="detail-text" style={{color:'#555'}}>—</div>}</div>
            </>
          )}
          <div className="links">
            {film.tmdbId && <a href={`https://www.themoviedb.org/movie/${film.tmdbId}`} target="_blank" className="link-btn">TMDB</a>}
            <a href={`https://www.imdb.com/find/?q=${encodeURIComponent(film.title + ' ' + film.year)}`} target="_blank" className="link-btn">IMDb</a>
            <a href={`https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(film.title)}`} target="_blank" className="link-btn">JustWatch</a>
          </div>
          {film.tmdbId && film.status !== 'watched' && <Suggestions id={film.tmdbId} />}
          {showDate && (
            <div className="detail-section">
              <div className="detail-section-title">Date</div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{padding:'0.5rem',background:'#000',border:'2px solid #333',color:'#fff',fontFamily:'inherit'}} />
                <button className="btn" onClick={() => onWatched(date)}>OK</button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-actions">
          {film.status === 'proposed' && (
            <>
              <button className={`btn ${faved ? 'btn-red' : 'btn-outline'}`} onClick={onFav}>{faved ? '♥' : '♡'}</button>
              <button className={`btn ${voted ? 'btn-yellow' : 'btn-outline'}`} onClick={onVote}>{voted ? '▲' : '△'}</button>
              <button className="btn" onClick={onSchedule}>Programmer</button>
            </>
          )}
          {film.status === 'scheduled' && (
            <>
              <button className="btn btn-outline" onClick={onUnschedule}>Déprogrammer</button>
              <button className="btn" onClick={() => setShowDate(true)}>Vu !</button>
            </>
          )}
          {(isProposer || film.status === 'watched') && <button className="btn btn-red" onClick={onDelete}>Supprimer</button>}
        </div>
      </div>
    </div>
  );
};

const AddModal = ({ onClose, onAdd }) => {
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try { const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=fr-FR&query=${encodeURIComponent(q)}`); const data = await res.json(); setResults(data.results?.slice(0, 10) || []); } catch(e) { console.error(e); }
    setLoading(false);
  };
  const select = async (r) => {
    try {
      const [det, cred] = await Promise.all([fetch(`https://api.themoviedb.org/3/movie/${r.id}?api_key=${TMDB_KEY}&language=fr-FR`).then(x => x.json()), fetch(`https://api.themoviedb.org/3/movie/${r.id}/credits?api_key=${TMDB_KEY}`).then(x => x.json())]);
      onAdd({ tmdbId: r.id, title: det.title, year: det.release_date?.split('-')[0] || '', poster: det.poster_path ? TMDB_IMG + det.poster_path : null, director: cred.crew?.find(c => c.job === 'Director')?.name || '', actors: cred.cast?.slice(0, 4).map(a => a.name).join(', ') || '', genres: det.genres?.map(g => g.name).join(', ') || '', overview: det.overview || '', runtime: det.runtime || 0 });
    } catch(e) { console.error(e); }
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div className="modal-title">Proposer</div><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
            <input className="search-box" placeholder="Titre..." value={q} onChange={e => setQ(e.target.value)} onKeyPress={e => e.key === 'Enter' && search()} autoFocus style={{flex:1}} />
            <button className="btn" onClick={search}>{loading ? '...' : 'GO'}</button>
          </div>
          {results.length > 0 && <div className="search-results">{results.map(r => (
            <div key={r.id} className="search-result" onClick={() => select(r)}>
              {r.poster_path ? <img src={TMDB_IMG + r.poster_path} alt="" /> : <div className="result-noimg">?</div>}
              <div><div className="result-title">{r.title}</div><div className="result-meta">{r.release_date?.split('-')[0] || '?'}</div></div>
            </div>
          ))}</div>}
        </div>
      </div>
    </div>
  );
};

const Suggestions = ({ id }) => {
  const [sug, setSug] = React.useState([]);
  React.useEffect(() => { fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${TMDB_KEY}&language=fr-FR`).then(r => r.json()).then(d => setSug(d.results?.slice(0, 6) || [])).catch(() => {}); }, [id]);
  if (!sug.length) return null;
  return (
    <div className="suggestions">
      <div className="detail-section-title">Films similaires</div>
      <div className="suggestions-grid">{sug.map(s => (
        <a key={s.id} href={`https://www.themoviedb.org/movie/${s.id}`} target="_blank" className="suggestion-card">
          {s.poster_path ? <img src={TMDB_IMG + s.poster_path} alt="" /> : <div style={{aspectRatio:'2/3',background:'#1a1a1a'}} />}
          <div className="suggestion-info"><div className="suggestion-title">{s.title}</div></div>
        </a>
      ))}</div>
    </div>
  );
};

const Planning = ({ avail, user, onToggle }) => {
  const [month, setMonth] = React.useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const today = new Date(); today.setHours(0,0,0,0);
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const days = [...Array(offset).fill(null), ...Array.from({length: dim}, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const mName = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const best = Object.entries(avail).filter(([d]) => new Date(d) >= today).map(([d, u]) => ({ d, u, c: u.length })).sort((a, b) => b.c - a.c).slice(0, 5);

  return (
    <div>
      <div className="section-title">Tes dispos</div>
      <div className="calendar-nav">
        <button className="btn btn-outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button>
        <div className="calendar-month">{mName}</div>
        <button className="btn btn-outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button>
      </div>
      <div className="calendar-grid">
        {['L','M','M','J','V','S','D'].map((d,i) => <div key={i} className="calendar-header">{d}</div>)}
        {days.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const k = date.toISOString().split('T')[0];
          const members = avail[k] || [];
          const isA = members.includes(user);
          const past = date < today;
          return <div key={k} className={`calendar-day ${isA ? 'available' : ''} ${past ? 'past' : ''}`} onClick={() => !past && onToggle(date)}><div className="calendar-day-num">{date.getDate()}</div>{members.length > 0 && <div className="calendar-day-count">{members.length}</div>}</div>;
        })}
      </div>
      <div style={{marginTop:'2rem'}}>
        <div className="section-title">Meilleures dates</div>
        {best.length > 0 ? best.map(({ d, u }) => (
          <div key={d} className="history-item" style={{cursor:'default'}}>
            <div className="history-date" style={{minWidth:'100px'}}>{formatDate(d)}</div>
            <div className="history-info"><div className="voters-list">{u.map(x => <div key={x} className="voter-chip" style={{background:getMember(x).color+'30'}}>{getMember(x).name}</div>)}</div></div>
            <div style={{fontFamily:'Bebas Neue',color:'var(--green)'}}>{u.length}/{MEMBERS.length}</div>
          </div>
        )) : <div className="empty">Pas encore de dispos</div>}
      </div>
    </div>
  );
};

const MembersTab = ({ films }) => {
  const stats = (id) => ({ prop: films.filter(f => f.proposedBy === id).length, watched: films.filter(f => f.proposedBy === id && f.status === 'watched').length, favs: films.filter(f => f.proposedBy === id).reduce((a, f) => a + (f.favorites?.length || 0), 0) });
  const watched = films.filter(f => f.status === 'watched');
  const bestP = MEMBERS.map(m => ({ ...m, w: watched.filter(f => f.proposedBy === m.id).length })).sort((a, b) => b.w - a.w)[0];
  const mostActive = MEMBERS.map(m => ({ ...m, v: films.filter(f => f.votes?.includes(m.id)).length })).sort((a, b) => b.v - a.v)[0];

  return (
    <div>
      <div className="section-title">Membres</div>
      <div className="members-grid">
        {MEMBERS.map(m => { const s = stats(m.id); return (
          <div key={m.id} className="member-card">
            <div className="member-avatar" style={{background:m.color}}>{m.name[0]}</div>
            <div className="member-name">{m.name}</div>
            <div className="member-stats">{s.prop} proposé{s.prop > 1 ? 's' : ''}<br/>{s.watched} vu{s.watched > 1 ? 's' : ''}<br/>{s.favs} ♥</div>
          </div>
        ); })}
      </div>
      <div style={{marginTop:'2rem'}}>
        <div className="section-title">Hall of Fame</div>
        <div style={{display:'grid',gap:'1rem',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))'}}>
          <div className="member-card"><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🎬</div><div className="member-name">Meilleur goût</div><div className="member-stats">{bestP?.w > 0 ? <><span style={{color:bestP.color}}>{bestP.name}</span><br/>{bestP.w} film{bestP.w > 1 ? 's' : ''} vu{bestP.w > 1 ? 's' : ''}</> : '—'}</div></div>
          <div className="member-card"><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>⚡</div><div className="member-name">Plus actif</div><div className="member-stats">{mostActive?.v > 0 ? <><span style={{color:mostActive.color}}>{mostActive.name}</span><br/>{mostActive.v} vote{mostActive.v > 1 ? 's' : ''}</> : '—'}</div></div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
