import { useEffect, useMemo, useState } from 'react';
import { CATALOG, GROUPS, WEARABLE } from '../data/catalog.js';
import { PINTEREST_BOARD } from '../config.js';
import { useApp } from '../state.jsx';
import { Img, SectionHead, pinUrl } from '../components.jsx';

export default function Explore() {
  const { ids, toggle } = useApp();
  const [group, setGroup] = useState('All');
  const [q, setQ] = useState('');
  const items = useMemo(() => CATALOG.filter((p) => (group === 'All' || p.group === group) && p.name.toLowerCase().includes(q.toLowerCase())), [group, q]);

  useEffect(() => {
    if (!PINTEREST_BOARD) return;
    const s = document.createElement('script');
    s.src = 'https://assets.pinterest.com/js/pinit.js'; s.async = true;
    document.body.appendChild(s);
    return () => s.remove();
  }, []);

  return (
    <div className="wrap sect">
      <SectionHead eyebrow="Explore" title="The catalog" sub="Add clothing and footwear to your closet. Makeup and jewelry are matched for you in the Studio." />
      <div className="toolbar">
        <div className="tabs">
          {['All', ...GROUPS].map((g) => (<button key={g} className={g === group ? 'on' : ''} onClick={() => setGroup(g)}>{g}</button>))}
        </div>
        <input className="search" placeholder="Search pieces" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search pieces" />
      </div>
      <div className="grid4">
        {items.map((p) => {
          const wearable = WEARABLE.includes(p.cat), inCloset = ids.includes(p.id);
          return (
            <article key={p.id} className="card">
              <Img item={p} />
              <div className="meta">
                <b>{p.name}</b>
                <small><i className="dot" style={{ background: p.color }} />{p.cat}{p.metal ? ` · ${p.metal}` : ''}</small>
                <div className="acts">
                  {wearable && <button className={`btn small ${inCloset ? 'ghost' : ''}`} onClick={() => toggle(p.id)}>{inCloset ? 'In closet' : 'Add to closet'}</button>}
                  <a className="btn small ghost" href={pinUrl(p)} target="_blank" rel="noreferrer">Pin it</a>
                </div>
              </div>
            </article>
          );
        })}
        {!items.length && <p className="empty">No pieces match “{q}”.</p>}
      </div>
      {PINTEREST_BOARD && (
        <section className="sect">
          <SectionHead eyebrow="Inspiration" title="Our Pinterest board" />
          <a data-pin-do="embedBoard" data-pin-board-width="1000" data-pin-scale-height="380" data-pin-scale-width="115" href={PINTEREST_BOARD} />
        </section>
      )}
    </div>
  );
}
