import { useEffect, useMemo, useRef, useState } from 'react';
import { BY_ID } from '../data/catalog.js';
import { TONES, UNDERTONES, OCCASIONS, WEATHER, REC, buildLooks, finishLook, dominantColor, weatherBucket } from '../lib/stylist.js';
import { useApp } from '../state.jsx';
import { Img, SectionHead } from '../components.jsx';

export default function Studio() {
  const { closet, ids, toggle, custom, addCustom, removeCustom, profile, setProfile, saveLook } = useApp();
  const [occ, setOcc] = useState('College');
  const [wx, setWx] = useState('Mild');
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState('');
  const [cat, setCat] = useState('Top');
  const [name, setName] = useState('');
  const fileRef = useRef(null);

  const occIndex = OCCASIONS.findIndex(([n]) => n === occ);
  const looks = useMemo(() => buildLooks(closet, { occasion: OCCASIONS[occIndex][1], weather: WEATHER[wx], undertone: profile.under }), [closet, occIndex, wx, profile.under]);
  useEffect(() => setSel(0), [occ, wx, profile.under]);
  const look = looks[Math.min(sel, looks.length - 1)];
  const fin = look && finishLook(look, { occasionIndex: occIndex, undertone: profile.under }, BY_ID);

  const liveWeather = () => {
    if (!navigator.geolocation) return setMsg('Location is not available in this browser.');
    setMsg('Reading your local weather…');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,precipitation`);
        const { current } = await r.json();
        setWx(weatherBucket(current.temperature_2m, current.precipitation));
        setMsg(`It is ${Math.round(current.temperature_2m)}°C where you are.`);
      } catch { setMsg('Could not reach the weather service. Choose manually.'); }
    }, () => setMsg('Location permission was denied. Choose the weather manually.'));
  };

  const upload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = 48, cv = document.createElement('canvas'); cv.width = cv.height = s;
        const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0, s, s);
        const d = cx.getImageData(0, 0, s, s).data, px = [];
        for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
        const color = dominantColor(px);
        addCustom({ id: `u-${Date.now()}`, name: name || `My ${cat.toLowerCase()}`, cat, color, f: cat === 'Dress' ? 3 : 2, w: cat === 'Bottom' ? 2 : 1, img: reader.result });
        setName(''); setMsg(`Detected the dominant color ${color} and added it to your closet.`);
        if (fileRef.current) fileRef.current.value = '';
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    const parts = look.parts.map((p) => ({ id: p.id, name: p.name, cat: p.cat, color: p.color, custom: !!p.img }));
    const extras = [fin.lipstick, fin.blush, fin.eyes, fin.jewelry].map((p) => ({ id: p.id, name: p.name, cat: p.cat, color: p.color }));
    saveLook({ parts, extras, pct: look.pct, occ, under: profile.under, metal: fin.metal, at: new Date().toISOString() });
    setMsg('Saved to your Lookbook.');
  };

  return (
    <div className="wrap sect">
      <SectionHead eyebrow="Studio" title="Your styling studio" sub="Set your profile, choose the moment, and Muse assembles the look." />
      <div className="studio">
        <aside className="panel">
          <h3>Skin tone</h3>
          <div className="tones">{TONES.map(([n, c], i) => (<button key={n} title={n} aria-label={n} className={i === profile.tone ? 'on' : ''} style={{ background: c }} onClick={() => setProfile({ ...profile, tone: i })} />))}</div>
          <h3>Undertone</h3>
          <div className="chips">{UNDERTONES.map(([k, l]) => (<button key={k} className={k === profile.under ? 'on' : ''} onClick={() => setProfile({ ...profile, under: k })}>{l}</button>))}</div>
          <p className="hint">{UNDERTONES.find(([k]) => k === profile.under)[2]}</p>
          <h3>Occasion</h3>
          <div className="chips">{OCCASIONS.map(([n]) => (<button key={n} className={n === occ ? 'on' : ''} onClick={() => setOcc(n)}>{n}</button>))}</div>
          <h3>Weather</h3>
          <div className="chips">{Object.keys(WEATHER).map((w) => (<button key={w} className={w === wx ? 'on' : ''} onClick={() => setWx(w)}>{w}</button>))}</div>
          <button className="btn small ghost full" onClick={liveWeather}>Use my location’s weather</button>
          {msg && <p className="hint" role="status">{msg}</p>}
        </aside>

        <div className="results">
          {!looks.length && <p className="empty">Add at least one top and bottom, or a dress, to your closet to see looks.</p>}
          {looks.length > 0 && (
            <>
              <div className="looks">
                {looks.map((l, i) => (
                  <button key={i} className={`card look ${i === sel ? 'sel' : ''}`} onClick={() => setSel(i)}>
                    <div className="lh"><b>Look {i + 1}</b><span className="score">{l.pct}%</span></div>
                    <div className="parts">{l.parts.map((p) => (<div key={p.id} className="part"><Img item={p} ratio="1 / 1" /><small>{p.name}</small></div>))}</div>
                    <p className="why">{l.note}.</p>
                  </button>
                ))}
              </div>
              <div className="final card">
                <div className="lh"><h3>The complete look</h3><button className="btn small" onClick={save}>Save to lookbook</button></div>
                <div className="finish">
                  <div className="swatch"><i style={{ background: TONES[profile.tone][1] }} /><small>Foundation</small><span>Match to your {TONES[profile.tone][0].toLowerCase()} skin</span></div>
                  {[['Lipstick', fin.lipstick], ['Blush', fin.blush], ['Eyes', fin.eyes], [`Jewelry · ${fin.metal}`, fin.jewelry]].map(([label, p]) => (
                    <div key={label} className="prod"><Img item={p} ratio="1 / 1" /><small>{label}</small><span>{p.name}</span></div>
                  ))}
                </div>
                <p className="hint">Shades are chosen for a {profile.under} undertone at {occIndex >= 3 ? 'bold' : occIndex === 2 ? 'medium' : 'soft'} intensity for {occ.toLowerCase()}. The metal is {REC[profile.under].metal.toLowerCase()}.</p>
              </div>
            </>
          )}

          <div className="closet card">
            <div className="lh"><h3>Your closet <small>({closet.length} pieces)</small></h3></div>
            <div className="strip">
              {closet.map((p) => (
                <div key={p.id} className="chipitem"><Img item={p} ratio="1 / 1" /><small>{p.name}</small>
                  <button aria-label={`Remove ${p.name}`} onClick={() => (p.id.startsWith('u-') ? removeCustom(p.id) : toggle(p.id))}>×</button>
                </div>
              ))}
            </div>
            <div className="upload">
              <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">{['Top', 'Bottom', 'Dress', 'Shoes'].map((c) => <option key={c}>{c}</option>)}</select>
              <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <label className="btn small">Upload a photo<input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} /></label>
            </div>
            <p className="hint">Photos stay in your browser. The dominant color is found on your device with K-Means clustering.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
