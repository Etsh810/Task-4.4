import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed = [
  { id: 'f1', title: 'Black backpack', category: 'accessories', status: 'lost', location: 'Library - second floor', description: 'Black backpack with a small red keychain. Left near the study desks.', owner: 'you', created: 'Oct 23', emoji: '🎒' },
  { id: 'f2', title: 'Dark backpack', category: 'accessories', status: 'found', location: 'Library - main stairwell', description: 'Found a dark backpack with a small red keychain near the library stairs.', owner: 'other', created: 'Oct 24', emoji: '🎒', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f3', title: 'Student ID card', category: 'documents', status: 'found', location: 'Near Gate 3', description: 'A student card was turned in. No personal details are published.', owner: 'other', created: 'Oct 24', emoji: '🪪', collectionPoint: 'Student Services Office', handoverStatus: 'received' },
  { id: 'f4', title: 'Wireless earbuds', category: 'electronics', status: 'lost', location: 'Main cafeteria', description: 'White earbuds in a distinctive blue case. Lost on Monday.', owner: 'other', created: 'Oct 24', emoji: '🎧' },
  { id: 'f5', title: 'Earbuds in blue case', category: 'electronics', status: 'found', location: 'Cafeteria entrance', description: 'White earbuds in a blue charging case found near the coffee counter.', owner: 'other', created: 'Oct 25', emoji: '🎧', collectionPoint: '', handoverStatus: 'reported' },
  { id: 'f6', title: 'Blue sports bottle', category: 'other', status: 'lost', location: 'Sports Hall - lockers', description: 'Tall blue metal water bottle, possibly left after practice.', owner: 'other', created: 'Oct 25', emoji: '🥤' },
  { id: 'f7', title: 'Metal water bottle', category: 'other', status: 'found', location: 'Sports Hall - benches', description: 'Blue reusable metal bottle found after a basketball session.', owner: 'other', created: 'Oct 25', emoji: '🥤', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f8', title: 'Engineering lab coat', category: 'clothing', status: 'claimed', location: 'Building C', description: 'Owner verified the item and collected it from the reception desk.', owner: 'you', created: 'Oct 22', emoji: '🥼', collectionPoint: 'Library Reception', handoverStatus: 'released' },
  { id: 'f9', title: 'Small notebook', category: 'other', status: 'lost', location: 'C7 lecture room', description: 'Brown cover with handwritten engineering notes.', owner: 'other', created: 'Oct 25', emoji: '📒' },
  { id: 'f10', title: 'Scientific calculator', category: 'electronics', status: 'lost', location: 'B2 lecture hall', description: 'Black scientific calculator with a protective cover.', owner: 'other', created: 'Oct 26', emoji: '🧮' },
  { id: 'f11', title: 'Calculator', category: 'electronics', status: 'found', location: 'B2 study area', description: 'Scientific calculator with a black cover, found on a desk.', owner: 'you', created: 'Oct 26', emoji: '🧮', collectionPoint: 'Library Reception', handoverStatus: 'received' },
  { id: 'f12', title: 'Canvas tote bag', category: 'accessories', status: 'lost', location: 'Main campus bus stop', description: 'Beige tote with green writing on one side.', owner: 'other', created: 'Oct 26', emoji: '👜' },
  { id: 'f13', title: 'USB flash drive', category: 'electronics', status: 'found', location: 'Building A computer lab', description: 'A small black flash drive was found beside a workstation.', owner: 'other', created: 'Oct 27', emoji: '💾', collectionPoint: '', handoverStatus: 'reported' },
];
const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];
const clean = { title: '', category: '', status: '', location: '', description: '', image: '' };

function getSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(saved) ? saved : seed;
  } catch {
    return seed;
  }
}

const cap = value => value.charAt(0).toUpperCase() + value.slice(1);

function normalize(value) {
  return (value || '')
    .normalize('NFKC')
    .replace(/⌖/g, ' ')
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

function validate(form, items, currentId) {
  if (!form.title.trim() || form.title.trim().length < 2) return 'Title must be at least 2 characters.';
  if (!categories.slice(1).includes(form.category)) return 'Choose a category.';
  if (!statuses.includes(form.status)) return 'Choose lost, found or claimed.';
  const duplicate = items.find(item => item.id !== currentId && normalize(item.title) === normalize(form.title) && normalize(item.location) === normalize(form.location));
  if (duplicate) return `A report for “${duplicate.title}” at “${duplicate.location || 'Location not provided'}” already exists. Check the noticeboard before posting another report.`;
  return '';
}

function resizeImage(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onerror = () => onError('That image could not be read. Try another file.');
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => onError('That image could not be opened. Try another file.');
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        onError('Image processing is unavailable in this browser.');
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
      if (dataUrl.length > 1_200_000) {
        onError('This image is still too large after resizing. Choose a smaller image.');
        return;
      }
      onSuccess(dataUrl);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [activeStatus, setActiveStatus] = useState('lost');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [message, setMessage] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

  const filtered = useMemo(() => items.filter(item =>
    (cat === 'all' || item.category === cat) &&
    `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.toLowerCase())
  ), [items, q, cat]);
  const visibleItems = filtered.filter(item => item.status === activeStatus);

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setError('');
    setImageError('');
    setPage('form');
  }

  function edit(item) {
    if (item.owner !== 'you') return;
    setCurrent(item.id);
    setForm({ title: item.title, category: item.category, status: item.status, location: item.location, description: item.description, image: item.image || '' });
    setOpenMenu(null);
    setError('');
    setImageError('');
    setPage('form');
  }

  function remove(item) {
    if (item.owner !== 'you') return;
    if (!window.confirm(`Delete your “${item.title}” report? This cannot be undone.`)) return;
    setItems(existing => existing.filter(report => report.id !== item.id));
    setOpenMenu(null);
    setMessage('Your report was deleted.');
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file.');
      return;
    }
    setImageError('');
    resizeImage(file, image => setForm(existing => ({ ...existing, image })), setImageError);
    event.target.value = '';
  }

  function submit(event) {
    event.preventDefault();
    const validationError = validate(form, items, current);
    if (validationError) {
      setError(validationError);
      return;
    }
    const data = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current ? items.find(item => item.id === current)?.emoji : '📌',
      ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' }),
    };
    if (current) {
      setItems(existing => existing.map(item => item.id === current ? { ...item, ...data } : item));
      setMessage('Report updated.');
    } else {
      setItems(existing => [{ id: `f-${Date.now()}`, ...data }, ...existing]);
      setMessage('Your report has been posted.');
    }
    setPage('board');
    setCurrent(null);
  }

  function resetFilters() {
    setQ('');
    setCat('all');
  }

  function reset() {
    setItems(seed);
    setPage('board');
    setActiveStatus('lost');
    resetFilters();
    setMessage('Example reports restored.');
  }

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>
          <button onClick={() => setPage('board')} className="wordmark">FOUND<span>on campus</span></button>
          <p>Community noticeboard</p>
        </div>
        <div className="header-links">
          <button onClick={() => setPage('board')}>Noticeboard</button>
          <button onClick={() => { setActiveStatus('lost'); setPage('board'); }}>Missing items</button>
          <button onClick={() => { setActiveStatus('found'); setPage('board'); }}>Recently found</button>
        </div>
      </header>
      <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
      {page === 'board' ? (
        <main className="workspace">
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>
            <h1>Lost something?<br /><em>You're in the right place.</em></h1>
            <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
            <div className="filterbox">
              <h3>Browse reports</h3>
              <label>Search items<input value={q} onChange={event => setQ(event.target.value)} placeholder="What are you looking for?" /></label>
              <label>Item category<select value={cat} onChange={event => setCat(event.target.value)}><option value="all">All categories</option>{categories.slice(1).map(category => <option key={category} value={category}>{cap(category)}</option>)}</select></label>
              <p className="filter-hint">Results update as you change filters.</p>
              <div className="filterbuttons"><button onClick={resetFilters}>Clear filters</button></div>
            </div>
            <button className="reset" onClick={reset}>Reset demo data</button>
          </aside>
          <section className="board">
            <div className="board-top">
              <div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({visibleItems.length})</span></h2></div>
              <button className="report-button board-report-button" onClick={create}>+ Post a report</button>
            </div>
            {message && <div className="message" role="status">{message}<button onClick={() => setMessage('')}>✕</button></div>}
            <div className="status-tabs" role="tablist" aria-label="Report status">
              {statuses.map(status => (
                <button key={status} role="tab" aria-selected={activeStatus === status} className={activeStatus === status ? 'status-tab active' : 'status-tab'} onClick={() => setActiveStatus(status)}>
                  <span>{cap(status)}</span><span className="tab-count">{items.filter(item => item.status === status).length}</span>
                </button>
              ))}
            </div>
            {visibleItems.length > 0 ? (
              <div className="tab-results" role="tabpanel">
                {visibleItems.map(item => (
                  <article className="sticky" key={item.id}>
                    <div className="sticky-top">
                      <span>{item.category}</span>
                      <div className="menu-holder">
                        <button className="menu" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} aria-label={`Actions for ${item.title}`}>···</button>
                        {openMenu === item.id && <div className="menu-popup">{item.owner === 'you' ? <><button onClick={() => edit(item)}>Edit your report</button><button className="delete-report" onClick={() => remove(item)}>Delete your report</button></> : <span>Reported by another student</span>}</div>}
                      </div>
                    </div>
                    {item.image ? <img className="sticky-photo" src={item.image} alt={`Photo of ${item.title}`} /> : <div className="sticky-emoji">{item.emoji}</div>}
                    <h3>{item.title}</h3>
                    <p>{item.description || 'No additional description.'}</p>
                    {item.status !== 'lost' && <div className="handover-note">{item.handoverStatus === 'received' && item.collectionPoint ? <><strong>To recover it:</strong> Ask staff at {item.collectionPoint}. They will verify ownership before returning it.</> : item.handoverStatus === 'released' ? 'Collected by owner' : 'Not at a collection point yet. A report alone does not mean staff are holding the item. If you found it, hand it to a designated campus collection point so its owner can recover it.'}</div>}
                    <div className="sticky-bottom"><span>⌖ {item.location || 'Location not provided'}</span><small>{item.created}</small></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-results" role="status">
                <h3>No {activeStatus} reports match these filters</h3>
                <p>Try another search or category, or clear your filters to see all {activeStatus} reports.</p>
                <button onClick={resetFilters}>Clear filters</button>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs"><button onClick={() => setPage('board')}>← Noticeboard</button><span>/</span><span>Report an item</span></div>
          <div className="report-layout">
            <div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current ? 'Update your report' : 'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
            <section className="form-paper">
              <header><p>{current ? 'EDIT NOTICE / FORM 01' : 'NEW NOTICE / FORM 01'}</p><h2>{current ? 'Edit report' : 'Report an item'}</h2></header>
              <form onSubmit={submit}>
                <label>Item title <b>*</b><input value={form.title} onChange={event => setForm(existing => ({ ...existing, title: event.target.value }))} placeholder="e.g., Black backpack" /></label>
                <label>Status <b>*</b><select value={form.status} onChange={event => setForm(existing => ({ ...existing, status: event.target.value }))}><option value="">Choose one</option>{statuses.map(status => <option key={status} value={status}>{cap(status)}</option>)}</select></label>
                <label>Category <b>*</b><select value={form.category} onChange={event => setForm(existing => ({ ...existing, category: event.target.value }))}><option value="">Select item category</option>{categories.slice(1).map(category => <option key={category} value={category}>{cap(category)}</option>)}</select></label>
                <label>Last known location<input value={form.location} onChange={event => setForm(existing => ({ ...existing, location: event.target.value }))} placeholder="Location (optional)" /></label>
                <label>More details<textarea rows="6" value={form.description} onChange={event => setForm(existing => ({ ...existing, description: event.target.value }))} placeholder="Describe your item" /></label>
                <label className="photo-field">Photo (optional)<input type="file" accept="image/*" onChange={chooseImage} /><small>Images are resized and saved with this report in this browser.</small></label>
                {form.image && <div className="image-preview"><img src={form.image} alt="Selected item preview" /><button type="button" onClick={() => setForm(existing => ({ ...existing, image: '' }))}>Remove photo</button></div>}
                {imageError && <div className="form-error" role="alert">{imageError}</div>}
                {error && <div className="form-error" role="alert">{error}</div>}
                <div className="form-actions"><button type="button" onClick={() => setPage('board')}>Go back</button><button className="report-button" type="submit">{current ? 'Save report' : 'Publish notice'}</button></div>
              </form>
            </section>
          </div>
        </main>
      )}
      <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
    </div>
  );
}
