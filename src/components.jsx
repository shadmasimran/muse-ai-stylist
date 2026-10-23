import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { GITHUB_URL } from './config.js';
import OVERRIDES from './data/image-overrides.json';

export const imgUrl = (id) => `${import.meta.env.BASE_URL}products/${id}.jpg`;

// Real photo when present; elegant color-tinted fallback otherwise.
export function Img({ item, ratio = '4 / 5', className = '' }) {
  const [bad, setBad] = useState(false);
  const src = item.img || OVERRIDES[item.id] || imgUrl(item.id);
  return (
    <div className={`img ${className}`} style={{ aspectRatio: ratio, '--tint': item.color }}>
      {!bad ? <img src={src} alt={item.name} loading="lazy" onError={() => setBad(true)} /> : <span className="ph">{item.cat}</span>}
    </div>
  );
}

export const pinUrl = (item) => {
  const media = new URL(item.img || OVERRIDES[item.id] || imgUrl(item.id), window.location.href).href;
  return `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href.split('#')[0])}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(item.name + ' | Muse by Shadma')}`;
};

export function Nav() {
  return (
    <header className="nav">
      <Link to="/" className="logo">Muse<span>by Shadma</span></Link>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/studio">Studio</NavLink>
        <NavLink to="/lookbook">Lookbook</NavLink>
      </nav>
      <Link to="/studio" className="btn small">Open Studio</Link>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot">
        <div>
          <div className="logo">Muse<span>by Shadma</span></div>
          <p>An AI personal stylist for wardrobe, makeup and jewelry.</p>
        </div>
        <div>
          <h4>Product</h4>
          <Link to="/explore">Explore</Link><Link to="/studio">Studio</Link><Link to="/lookbook">Lookbook</Link>
        </div>
        <div>
          <h4>Project</h4>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://unsplash.com/?utm_source=muse_by_shadma&utm_medium=referral" target="_blank" rel="noreferrer">Photography: Unsplash / Pexels</a>
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Weather: Open-Meteo</a>
        </div>
      </div>
      <div className="wrap legal">© 2026 Muse by Shadma. Built by Shaikh Shadma Simran, B.Tech Computer Engineering, Silver Oak University.</div>
    </footer>
  );
}

export function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="head">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}
