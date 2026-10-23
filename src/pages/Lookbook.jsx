import { Link } from 'react-router-dom';
import { useApp } from '../state.jsx';
import { Img, SectionHead } from '../components.jsx';

export default function Lookbook() {
  const { saved, deleteLook } = useApp();
  return (
    <div className="wrap sect">
      <SectionHead eyebrow="Lookbook" title="Your saved looks" sub="Looks are stored in this browser." />
      {!saved.length && <p className="empty">Nothing saved yet. <Link to="/studio">Style your first look</Link>.</p>}
      <div className="grid3">
        {saved.map((s, i) => (
          <article key={s.at + i} className="card saved">
            <div className="lh"><b>{s.occ} look</b><span className="score">{s.pct}%</span></div>
            <div className="parts">{s.parts.map((p) => (<div key={p.id} className="part"><Img item={p} ratio="1 / 1" /><small>{p.name}</small></div>))}</div>
            <div className="parts">{s.extras.map((p) => (<div key={p.id} className="part"><Img item={p} ratio="1 / 1" /><small>{p.name}</small></div>))}</div>
            <div className="lh"><small>{s.under} undertone · {s.metal}</small><button className="btn small ghost" onClick={() => deleteLook(i)}>Remove</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
