// ==========================================
// VIDEODROME — Ciné-Club Série B
// ==========================================

const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';

// ⚠️ REMPLACE PAR TON URL GOOGLE APPS SCRIPT
const SHEETS_API = 'COLLE_TON_URL_ICI';

const MEMBERS = [
  { id: 'seb', name: 'Seb', color: '#e63946', initial: 'S' },
  { id: 'bernard', name: 'Bernard', color: '#f4a261', initial: 'Bd' },
  { id: 'gary', name: 'Gary', color: '#e9c46a', initial: 'G' },
  { id: 'benoit', name: 'Benoit', color: '#2a9d8f', initial: 'Bt' },
  { id: 'arnaud', name: 'Arnaud', color: '#457b9d', initial: 'A' },
];

const getMember = (id) => MEMBERS.find(m => m.id === id) || { id, name: id, color: '#888', initial: '?' };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// Logo SVG
const LogoSVG = () => (
  <svg viewBox="0 0 771 92" className="logo-svg">
    <path d="M56.8 1.8L28.9 90.2H0L40.5 1.8h16.3zm12.3 0L40.5 90.2h28.6l14-44.6L97.5 90.2h28.6L84.4 1.8H69.1zm77.4 0L119 90.2h50l7.2-23h-21.5l21-65.4h-29.2zm65.5 0L188.1 90.2h50.1l7.2-23h-21.6l21-65.4h-29.2zm70.3 0l-23.9 88.4h50.1l7.2-23H294l21-65.4h-29.2zm57.9 0l-24.2 88.4h71.6l7.2-23h-42.8l4.8-15.2h35.6l6.3-20.5h-35.6l4.2-13.4h40.3l7.3-16.3h-68.7zm-90.6 0L225.7 90.2h29.1l6-19.4h.3c4.5 7.2 11.2 10.7 20 10.7 18.9 0 33.2-15.9 38.9-36.9 5.4-19.8-2.5-34.5-21.7-34.5-9.7 0-18 4.8-22.8 12.3h-.3l3.5-12.6h-29zm42.5 23.1c6.4 0 10 4.7 8.3 11-1.8 6.6-7.4 11.5-14 11.5-6.5 0-10-4.8-8.3-11.2 1.7-6.4 7.5-11.3 14-11.3zm97.6-23.1l-23.9 88.4h29.1l7.5-27.4h10.2c23.9 0 40.2-12.2 45-29.9 5.1-18.8-6.7-31.1-30.6-31.1h-37.3zm30.9 20c5.9 0 9.4 2.8 8 8-1.4 5-5.9 8.1-11.8 8.1h-8.8l4.2-16.1h8.4zm76.5-20l-22 88.4h68.5l5-20.2h-39.4l4.3-17.2h32.3l5-20h-32.3l3.3-13.5h37.2l5.2-17.5h-66.1zm101.5 0l-24.2 88.4h50l7.2-23h-21.6l21-65.4h-29.2zm72.9 0l-21.2 88.4h29.1l9-37.1 21.1 37.1h34l-30.2-44.7 45.7-43.7h-35.7l-29.3 32.4h-.3l7.9-32.4h-30.1z"/>
  </svg>
);

// Toast
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`}>{message}</div>;
};

// VHS Poster
const VHSPoster = ({ title }) => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #1a0a2e 0%, #d4145a 50%, #fbb03b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fbb03b', marginBottom: '50px', boxShadow: '0 0 40px #fbb03b' }}></div>
    <div style={{ position: 'absolute', bottom: '50px', width: '100%', height: '70px', background: '#000', clipPath: 'polygon(20% 100%, 30% 60%, 40% 80%, 50% 40%, 60% 70%, 70% 50%, 80% 100%)' }}></div>
    <div style={{ position: 'absolute', bottom: '15px', fontFamily: 'Impact, sans-serif', fontSize: '1rem', color: '#fbb03b', textTransform: 'uppercase', textShadow: '1px 1px 0 #000' }}>{title}</div>
  </div>
);

// VHS Tape
const VHSTape = ({ title }) => (
  <div style={{ width: '100%', height: '100%', background: '#1a1a1a', borderRadius: '4px', display: 'flex', flexDirection: 'column', padding: '5%', position: 'relative', boxSizing: 'border-box' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px), linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)', backgroundSize: '5px 5px', borderRadius: '4px', pointerEvents: 'none', zIndex: 1 }}></div>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '2px', height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.15), rgba(255,255,255,0.3))', borderRadius: '0 4px 4px 0', zIndex: 10 }}></div>
    <div style={{ width: '65%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #3a3a3a 0%, #222 30%, #1a1a1a 60%, #333 85%, #222 100%)', border: '3px solid #2a2a2a', margin: '0 auto', boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.8)', position: 'relative', zIndex: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #555 0%, #333 100%)', border: '2px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '35%', aspectRatio: '1', borderRadius: '50%', background: '#1a1a1a' }}></div>
      </div>
    </div>
    <div style={{ flex: 1, background: '#f5f5f0', borderRadius: '3px', margin: '8% 5%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.4)', position: 'relative', zIndex: 2, overflow: 'hidden' }}>
      <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', fontSize: '0.6rem', fontWeight: 700, color: '#222', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 0', textAlign: 'center' }}>{title}</div>
    </div>
    <div style={{ width: '65%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #ffffff 0%, #f0f0f0 30%, #ddd 60%, #eee 85%, #e0e0e0 100%)', border: '3px solid #ccc', margin: '0 auto', boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.15)', position: 'relative', zIndex: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #f5f5f5 0%, #ddd 100%)', border: '2px solid #bbb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '35%', aspectRatio: '1', borderRadius: '50%', background: '#ccc' }}></div>
      </div>
    </div>
  </div>
);

// Star path generator
const generateStarPath = (cx, cy, outerR, innerR, points) => {
  let path = '';
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += (i === 0 ? 'M' : 'L') + x + ',' + y;
  }
  return path + 'Z';
};

const STICKER_POSITIONS = [
  { top: '12%', right: '6%', rotate: -15 },
  { top: '38%', right: '4%', rotate: 10 },
  { top: '60%', right: '8%', rotate: -8 },
  { top: '25%', right: '12%', rotate: 18 },
  { top: '50%', right: '2%', rotate: -20 },
];

const VoteSticker = ({ memberId, index }) => {
  const member = getMember(memberId);
  const pos = STICKER_POSITIONS[index % STICKER_POSITIONS.length];
  const extraRotate = (index * 13) % 25 - 12;
  const starPath = generateStarPath(20, 20, 20, 15, 12);
  
  return (
    <div style={{ position: 'absolute', top: pos.top, right: pos.right, transform: `rotate(${pos.rotate + extraRotate}deg)`, zIndex: 20 + index, pointerEvents: 'none' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.4))' }}>
        <path d={starPath} fill={member.color} />
        <text x="20" y="20" textAnchor="middle" dominantBaseline="central" style={{ fontSize: member.initial.length > 1 ? '9px' : '12px', fontWeight: 800, fill: '#fff' }}>{member.initial}</text>
      </svg>
    </div>
  );
};

// VHS Card
const VHSCard = ({ film, user, onClick, onFav }) => {
  const [isActive, setIsActive] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const boxWidth = 175;
  const boxHeight = 260;
  const tapeWidth = 90;
  
  const isFav = film.favorites?.includes(user);
  const member = getMember(film.proposedBy);
  
  const handleMouseEnter = () => { setIsActive(true); setIsAnimating(true); };
  const handleMouseLeave = () => { setIsActive(false); setTimeout(() => setIsAnimating(false), 450); };
  
  return (
    <div className="vhs-card" style={{ width: boxWidth, height: boxHeight + 50, marginTop: Math.random() > 0.5 ? '20px' : '0', zIndex: isActive ? 200 : (isAnimating ? 100 : 1) }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}>
      <div style={{ position: 'relative', width: boxWidth, height: boxHeight, transform: isActive ? 'rotateY(0deg) rotateX(0deg) scale(1.15)' : 'rotateY(-15deg) rotateX(5deg)', transition: 'transform 0.4s ease', transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', top: 0, right: isActive ? -(tapeWidth * 0.625) : -15, width: tapeWidth, height: boxHeight, transition: 'right 0.4s ease', zIndex: -1, pointerEvents: 'none' }}>
          <VHSTape title={film.title} />
        </div>
        <div style={{ position: 'absolute', top: 0, left: -4, width: 4, height: '100%', background: 'linear-gradient(to bottom, #f5f0e6, #444)' }}></div>
        <div style={{ position: 'absolute', top: -2, left: -4, width: 'calc(100% + 4px)', height: 2, background: 'linear-gradient(to right, #f5f0e6, #444)' }}></div>
        <div style={{ position: 'absolute', bottom: -4, left: -4, width: 'calc(100% + 4px)', height: 4, background: '#333' }}></div>
        <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#000', boxShadow: isActive ? '0 25px 50px rgba(0,0,0,0.5)' : '10px 10px 25px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: member.color, zIndex: 10 }}></div>
          {film.votes?.map((voter, idx) => <VoteSticker key={voter} memberId={voter} index={idx} />)}
          {film.poster ? <img src={film.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <VHSPoster title={film.title} />}
          <button onClick={(e) => { e.stopPropagation(); onFav(); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: '1rem', cursor: 'pointer', zIndex: 30 }}>{isFav ? '❤️' : '🤍'}</button>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '3rem 0.75rem 0.75rem', zIndex: 20 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', textShadow: '1px 1px 0 #000' }}>{film.title}</div>
            <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{film.year}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// VHS Placeholder (affiche vide avec ?)
const VHSPlaceholder = ({ onClick }) => {
  const [isActive, setIsActive] = React.useState(false);
  const boxWidth = 175;
  const boxHeight = 260;
  
  return (
    <div className="vhs-card" style={{ width: boxWidth, height: boxHeight + 50, opacity: 0.5 }} onMouseEnter={() => setIsActive(true)} onMouseLeave={() => setIsActive(false)} onClick={onClick}>
      <div style={{ position: 'relative', width: boxWidth, height: boxHeight, transform: isActive ? 'rotateY(0deg) rotateX(0deg) scale(1.05)' : 'rotateY(-15deg) rotateX(5deg)', transition: 'transform 0.4s ease', transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', top: 0, left: -4, width: 4, height: '100%', background: 'linear-gradient(to bottom, #f5f0e6, #444)' }}></div>
        <div style={{ position: 'absolute', top: -2, left: -4, width: 'calc(100% + 4px)', height: 2, background: 'linear-gradient(to right, #f5f0e6, #444)' }}></div>
        <div style={{ position: 'absolute', bottom: -4, left: -4, width: 'calc(100% + 4px)', height: 4, background: '#333' }}></div>
        <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#1a1a1a', boxShadow: '10px 10px 25px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#444', zIndex: 10 }}></div>
          <div style={{ fontSize: '5rem', color: '#333', fontWeight: 700 }}>?</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '3rem 0.75rem 0.75rem', zIndex: 20 }}>
            <div style={{ color: '#555', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>+ Proposer un film</div>
          </div>
          {/* Lignes décoratives style VHS */}
          <div style={{ position: 'absolute', top: '20%', left: '10%', right: '10%', height: '2px', background: 'repeating-linear-gradient(90deg, #333 0px, #333 4px, transparent 4px, transparent 8px)' }}></div>
          <div style={{ position: 'absolute', top: '35%', left: '15%', right: '15%', height: '2px', background: 'repeating-linear-gradient(90deg, #333 0px, #333 4px, transparent 4px, transparent 8px)' }}></div>
        </div>
      </div>
    </div>
  );
};

// App
const App = () => {
  const [user, setUser] = React.useState(() => localStorage.getItem('vd_user') || 'seb');
  const [tab, setTab] = React.useState('propositions');
  const [films, setFilms] = React.useState(() => { try { return JSON.parse(localStorage.getItem('vd_films')) || []; } catch { return []; } });
  const [avail, setAvail] = React.useState(() => { try { return JSON.parse(localStorage.getItem('vd_avail')) || {}; } catch { return {}; } });
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('votes');
  const [selected, setSelected] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { localStorage.setItem('vd_user', user); }, [user]);
  React.useEffect(() => { localStorage.setItem('vd_films', JSON.stringify(films)); }, [films]);
  React.useEffect(() => { localStorage.setItem('vd_avail', JSON.stringify(avail)); }, [avail]);
  React.useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!SHEETS_API || SHEETS_API === 'COLLE_TON_URL_ICI') { setLoading(false); return; }
    setSyncing(true);
    try {
      const res = await fetch(SHEETS_API);
      const data = await res.json();
      if (data.films) setFilms(data.films.map(f => ({ ...f, id: parseInt(f.id) || f.id, year: parseInt(f.year) || 0, votes: f.votes ? (typeof f.votes === 'string' ? JSON.parse(f.votes) : f.votes) : [], favorites: f.favorites ? (typeof f.favorites === 'string' ? JSON.parse(f.favorites) : f.favorites) : [] })));
      if (data.availabilities) setAvail(data.availabilities);
      notify('Données synchronisées');
    } catch(e) { console.error(e); }
    setSyncing(false);
    setLoading(false);
  };

  const save = async (f, a) => {
    if (!SHEETS_API || SHEETS_API === 'COLLE_TON_URL_ICI') return;
    setSyncing(true);
    try { await fetch(SHEETS_API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ films: f || films, availabilities: a || avail }) }); } catch(e) { console.error(e); }
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
    notify(`"${film.title}" ajouté`);
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
    notify('Film programmé !');
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
    if (!confirm('Supprimer ce film ?')) return;
    const newFilms = films.filter(f => f.id !== id);
    setFilms(newFilms); save(newFilms); setSelected(null);
    notify('Film supprimé');
  };

  const toggleAvail = (date) => {
    const k = date.toISOString().split('T')[0];
    const cur = avail[k] || [];
    const newAvail = { ...avail, [k]: cur.includes(user) ? cur.filter(u => u !== user) : [...cur, user] };
    setAvail(newAvail); save(null, newAvail);
  };

  if (loading) return <div className="loading-screen"><div className="loading-logo">VIDEODROME</div></div>;

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-bands">{MEMBERS.map((m, i) => <div key={i} className="logo-band" style={{ background: m.color }}></div>)}</div>
            <div className="logo-container"><LogoSVG /><span className="logo-club">CLUB</span></div>
          </div>
          <div className="header-right">
            <select className="user-select" value={user} onChange={e => setUser(e.target.value)}>{MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
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
        <div className="hero" onClick={() => scheduled && setSelected(scheduled)} style={{ cursor: scheduled ? 'pointer' : 'default' }}>
          <div className="hero-content">
            <div style={{ width: 140, height: 210, background: '#000', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {scheduled ? (
                scheduled.poster ? <img src={scheduled.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <VHSPoster title={scheduled.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.3 }}>?</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'repeating-linear-gradient(90deg, #e63946 0px, #e63946 8px, transparent 8px, transparent 16px)' }}></div>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="hero-sticker">PROCHAINE SÉANCE</div>
              {scheduled ? (
                <>
                  <h1 className="hero-title">{scheduled.title}</h1>
                  <div className="hero-year">{scheduled.year} · {scheduled.director}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: getMember(scheduled.proposedBy).color }}></span><span style={{ fontWeight: 700 }}>Proposé par {getMember(scheduled.proposedBy).name}</span></div>
                </>
              ) : (
                <>
                  <h1 className="hero-title" style={{ opacity: 0.3 }}>EN ATTENTE</h1>
                  <div className="hero-year" style={{ opacity: 0.5 }}>Aucun film programmé</div>
                  <div style={{ opacity: 0.5, fontStyle: 'italic' }}>Programmez un film depuis les propositions</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'propositions' && (
        <>
          <div className="controls">
            <input className="search-box" placeholder="Rechercher un film..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={sort} onChange={e => setSort(e.target.value)}><option value="votes">▲ Votes</option><option value="favorites">♥ Favoris</option><option value="recent">Récents</option><option value="year">Année</option><option value="alpha">A → Z</option></select>
            <button className="btn" onClick={() => setShowAdd(true)}>+ Proposer</button>
          </div>
          <main className="main">
            <div className="section-title">À voter ({filtered.length})</div>
            <div className="vhs-grid">
              {filtered.map(f => <VHSCard key={f.id} film={f} user={user} onClick={() => setSelected(f)} onFav={() => fav(f.id)} />)}
              {/* Placeholders VHS */}
              {filtered.length < 6 && [...Array(Math.max(0, 6 - filtered.length))].map((_, i) => (
                <VHSPlaceholder key={`placeholder-${i}`} onClick={() => setShowAdd(true)} />
              ))}
            </div>
          </main>
        </>
      )}

      {tab === 'planning' && <main className="main"><Planning avail={avail} user={user} onToggle={toggleAvail} /></main>}

      {tab === 'historique' && (
        <main className="main">
          <div className="section-title">Films vus ({watched.length})</div>
          {watched.length > 0 ? watched.map(f => (
            <div key={f.id} className="film-card" onClick={() => setSelected(f)}>
              {f.poster ? <img className="film-poster" src={f.poster} alt="" /> : <div className="film-poster-placeholder">📼</div>}
              <div className="film-info"><div className="film-title">{f.title}</div><div className="film-meta">{f.year} · {f.director}</div><div className="film-meta">Proposé par {getMember(f.proposedBy).name}</div></div>
              <div className="film-date">{formatDate(f.watchedDate)}</div>
            </div>
          )) : <div className="empty"><div className="empty-icon">🎬</div>Aucun film vu</div>}
        </main>
      )}

      {tab === 'membres' && <main className="main"><MembersTab films={films} /></main>}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={add} />}
      {selected && <DetailModal film={selected} user={user} onClose={() => setSelected(null)} onVote={() => vote(selected.id)} onFav={() => fav(selected.id)} onSchedule={() => schedule(selected.id)} onUnschedule={() => unschedule(selected.id)} onWatched={(d) => markWatched(selected.id, d)} onDelete={() => del(selected.id)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// DetailModal
const DetailModal = ({ film, user, onClose, onVote, onFav, onSchedule, onUnschedule, onWatched, onDelete }) => {
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
            <div className="detail-poster">{film.poster ? <img src={film.poster} alt="" /> : <div style={{width:'100%',aspectRatio:'2/3',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>📼</div>}</div>
            <div><div className="detail-title">{film.title}</div><div className="detail-meta">{film.year} · {film.director}{film.runtime ? ` · ${film.runtime} min` : ''}</div><div className="detail-proposer" style={{background: p.color}}>Proposé par {p.name}</div></div>
          </div>
          {film.overview && <div className="detail-section"><div className="detail-section-title">Synopsis</div><div className="detail-text">{film.overview}</div></div>}
          {film.genres && <div className="detail-section"><div className="detail-section-title">Genres</div><div className="tags">{film.genres.split(',').map((g,i) => <span key={i} className="tag">{g.trim()}</span>)}</div></div>}
          {film.actors && <div className="detail-section"><div className="detail-section-title">Casting</div><div className="detail-text">{film.actors}</div></div>}
          {film.status !== 'watched' && (
            <>
              <div className="detail-section"><div className="detail-section-title">♥ Favoris ({film.favorites?.length || 0})</div>{film.favorites?.length > 0 ? <div className="voters-list">{film.favorites.map(v => <div key={v} className="voter-chip"><span className="voter-dot" style={{background:getMember(v).color}}></span>{getMember(v).name}</div>)}</div> : <div className="detail-text" style={{color:'#888'}}>—</div>}</div>
              <div className="detail-section"><div className="detail-section-title">▲ Votes ({film.votes?.length || 0})</div>{film.votes?.length > 0 ? <div className="voters-list">{film.votes.map(v => <div key={v} className="voter-chip"><span className="voter-dot" style={{background:getMember(v).color}}></span>{getMember(v).name}</div>)}</div> : <div className="detail-text" style={{color:'#888'}}>—</div>}</div>
            </>
          )}
          <div className="links">{film.tmdbId && <a href={`https://www.themoviedb.org/movie/${film.tmdbId}`} target="_blank" className="link-btn">TMDB</a>}<a href={`https://www.imdb.com/find/?q=${encodeURIComponent(film.title + ' ' + film.year)}`} target="_blank" className="link-btn">IMDb</a><a href={`https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(film.title)}`} target="_blank" className="link-btn">JustWatch</a></div>
          {film.tmdbId && film.status !== 'watched' && <Suggestions id={film.tmdbId} />}
          {showDate && <div className="detail-section"><div className="detail-section-title">Date de visionnage</div><div style={{display:'flex',gap:'0.5rem'}}><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{padding:'0.5rem',border:'2px solid #1a1a1a',fontFamily:'inherit'}} /><button className="btn" onClick={() => onWatched(date)}>Valider</button></div></div>}
        </div>
        <div className="modal-actions">
          {film.status === 'proposed' && <><button className={`btn ${faved ? '' : 'btn-outline'}`} onClick={onFav}>{faved ? '♥ Favori' : '♡ Favori'}</button><button className={`btn ${voted ? '' : 'btn-outline'}`} onClick={onVote}>{voted ? '✓ Voté' : '▲ Voter'}</button><button className="btn" onClick={onSchedule}>Programmer</button></>}
          {film.status === 'scheduled' && <><button className="btn btn-outline" onClick={onUnschedule}>Déprogrammer</button><button className="btn" onClick={() => setShowDate(true)}>Marquer vu</button></>}
          {(isProposer || film.status === 'watched') && <button className="btn btn-danger" onClick={onDelete}>Supprimer</button>}
        </div>
      </div>
    </div>
  );
};

// AddModal
const AddModal = ({ onClose, onAdd }) => {
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const search = async () => { if (!q.trim()) return; setLoading(true); try { const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=fr-FR&query=${encodeURIComponent(q)}`); const data = await res.json(); setResults(data.results?.slice(0, 10) || []); } catch(e) { console.error(e); } setLoading(false); };
  const select = async (r) => { try { const [det, cred] = await Promise.all([fetch(`https://api.themoviedb.org/3/movie/${r.id}?api_key=${TMDB_KEY}&language=fr-FR`).then(x => x.json()), fetch(`https://api.themoviedb.org/3/movie/${r.id}/credits?api_key=${TMDB_KEY}`).then(x => x.json())]); onAdd({ tmdbId: r.id, title: det.title, year: det.release_date?.split('-')[0] || '', poster: det.poster_path ? TMDB_IMG + det.poster_path : null, director: cred.crew?.find(c => c.job === 'Director')?.name || '', actors: cred.cast?.slice(0, 4).map(a => a.name).join(', ') || '', genres: det.genres?.map(g => g.name).join(', ') || '', overview: det.overview || '', runtime: det.runtime || 0 }); } catch(e) { console.error(e); } };
  return (<div className="modal-bg" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div className="modal-title">Proposer un film</div><button className="modal-close" onClick={onClose}>×</button></div><div className="modal-body"><div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}><input className="search-box" placeholder="Titre du film..." value={q} onChange={e => setQ(e.target.value)} onKeyPress={e => e.key === 'Enter' && search()} autoFocus style={{flex:1}} /><button className="btn" onClick={search}>{loading ? '...' : 'Chercher'}</button></div>{results.length > 0 && <div className="search-results">{results.map(r => (<div key={r.id} className="search-result" onClick={() => select(r)}>{r.poster_path ? <img src={TMDB_IMG + r.poster_path} alt="" /> : <div className="result-noimg">?</div>}<div><div className="result-title">{r.title}</div><div className="result-meta">{r.release_date?.split('-')[0] || '?'}{r.vote_average > 0 && ` · ⭐ ${r.vote_average.toFixed(1)}`}</div></div></div>))}</div>}</div></div></div>);
};

// Suggestions
const Suggestions = ({ id }) => {
  const [sug, setSug] = React.useState([]);
  React.useEffect(() => { fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${TMDB_KEY}&language=fr-FR`).then(r => r.json()).then(d => setSug(d.results?.slice(0, 6) || [])).catch(() => {}); }, [id]);
  if (!sug.length) return null;
  return (<div className="suggestions"><div className="detail-section-title">Films similaires</div><div className="suggestions-grid">{sug.map(s => (<a key={s.id} href={`https://www.themoviedb.org/movie/${s.id}`} target="_blank" className="suggestion-card">{s.poster_path ? <img src={TMDB_IMG + s.poster_path} alt="" /> : <div style={{aspectRatio:'2/3',background:'#1a1a1a'}} />}<div className="suggestion-title">{s.title}</div></a>))}</div></div>);
};

// Planning
const Planning = ({ avail, user, onToggle }) => {
  const [month, setMonth] = React.useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const today = new Date(); today.setHours(0,0,0,0);
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const days = [...Array(offset).fill(null), ...Array.from({length: dim}, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const mName = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const best = Object.entries(avail).filter(([d]) => new Date(d) >= today).map(([d, u]) => ({ d, u, c: u.length })).sort((a, b) => b.c - a.c).slice(0, 5);
  return (<div><div className="section-title">Tes disponibilités</div><div className="calendar-nav"><button className="btn btn-outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><div className="calendar-month">{mName}</div><button className="btn btn-outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div><div className="calendar-grid">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((d,i) => <div key={i} className="calendar-header">{d}</div>)}{days.map((date, i) => { if (!date) return <div key={`e${i}`} />; const k = date.toISOString().split('T')[0]; const members = avail[k] || []; const isA = members.includes(user); const past = date < today; return <div key={k} className={`calendar-day ${isA ? 'available' : ''} ${past ? 'past' : ''}`} onClick={() => !past && onToggle(date)}><div className="calendar-day-num">{date.getDate()}</div>{members.length > 0 && <div className="calendar-day-count">{members.length}</div>}</div>; })}</div><div style={{marginTop:'2rem'}}><div className="section-title">Meilleures dates</div>{best.length > 0 ? best.map(({ d, u }) => (<div key={d} className="film-card" style={{cursor:'default'}}><div style={{fontWeight:700,minWidth:'120px'}}>{formatDate(d)}</div><div className="film-info"><div className="voters-list">{u.map(x => <div key={x} className="voter-chip"><span className="voter-dot" style={{background:getMember(x).color}}></span>{getMember(x).name}</div>)}</div></div><div style={{fontWeight:700,color:'#e63946'}}>{u.length}/{MEMBERS.length}</div></div>)) : <div className="empty">Pas encore de disponibilités</div>}</div></div>);
};

// MembersTab
const MembersTab = ({ films }) => {
  const stats = (id) => ({ prop: films.filter(f => f.proposedBy === id).length, watched: films.filter(f => f.proposedBy === id && f.status === 'watched').length, favs: films.filter(f => f.proposedBy === id).reduce((a, f) => a + (f.favorites?.length || 0), 0) });
  const watched = films.filter(f => f.status === 'watched');
  const bestP = MEMBERS.map(m => ({ ...m, w: watched.filter(f => f.proposedBy === m.id).length })).sort((a, b) => b.w - a.w)[0];
  const mostActive = MEMBERS.map(m => ({ ...m, v: films.filter(f => f.votes?.includes(m.id)).length })).sort((a, b) => b.v - a.v)[0];
  return (<div><div className="section-title">Statistiques</div><div className="members-grid">{MEMBERS.map(m => { const s = stats(m.id); return (<div key={m.id} className="member-card"><div className="member-avatar" style={{background:m.color}}>{m.name[0]}</div><div className="member-name">{m.name}</div><div className="member-stats">{s.prop} proposé{s.prop > 1 ? 's' : ''}<br/>{s.watched} vu{s.watched > 1 ? 's' : ''}<br/>{s.favs} ♥ reçus</div></div>); })}</div><div style={{marginTop:'2rem'}}><div className="section-title">Hall of Fame</div><div style={{display:'grid',gap:'1rem',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))'}}><div className="member-card"><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🎬</div><div className="member-name">Meilleur goût</div><div className="member-stats">{bestP?.w > 0 ? <><span style={{color:bestP.color}}>{bestP.name}</span><br/>{bestP.w} film{bestP.w > 1 ? 's' : ''} vu{bestP.w > 1 ? 's' : ''}</> : '—'}</div></div><div className="member-card"><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>⚡</div><div className="member-name">Plus actif</div><div className="member-stats">{mostActive?.v > 0 ? <><span style={{color:mostActive.color}}>{mostActive.name}</span><br/>{mostActive.v} vote{mostActive.v > 1 ? 's' : ''}</> : '—'}</div></div></div></div></div>);
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
