import { Link } from 'react-router-dom';
import { BY_ID } from '../data/catalog.js';
import { Img, SectionHead } from '../components.jsx';

const HERO = ['d-floral', 't-blush-blouse', 's-heels'];
const FEATURED = ['d-wine', 'b-black-trouser', 'l-red', 'j-gold-hoops'];
const STEPS = [
  ['01', 'Know your tone', 'Choose your skin tone and undertone once. Every recommendation is tuned to it.'],
  ['02', 'Build your closet', 'Add pieces from the catalog or upload your own photos. K-Means clustering reads each piece’s true color.'],
  ['03', 'Get the whole look', 'Pick an occasion and the weather. Muse ranks outfits, then matches makeup and jewelry.'],
];
const FEATURES = [
  ['Color intelligence', 'Dominant colors are extracted from your photos with K-Means clustering, then paired using color-harmony rules.'],
  ['Undertone matching', 'Warm, cool and neutral undertones decide lipstick, blush, eye shades and the right metal.'],
  ['Live weather', 'Use your location to read today’s temperature and rain, so outfits are comfortable as well as stylish.'],
  ['Occasion aware', 'From casual days to weddings, formality is scored so you are never under or overdressed.'],
  ['Complete looks', 'Outfit, footwear, makeup and jewelry arrive together as one considered look.'],
  ['Your lookbook', 'Save favorite looks and return to them any time.'],
];

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow">AI personal stylist</div>
          <h1>Dress with <em>intention</em>.</h1>
          <p>Muse builds complete looks from the clothes you already own, then matches makeup and jewelry to your skin tone, the occasion and the weather.</p>
          <div className="row">
            <Link to="/studio" className="btn">Open the Studio</Link>
            <Link to="/explore" className="btn ghost">Explore the catalog</Link>
          </div>
          <dl className="stats">
            <div><dt>34</dt><dd>catalog pieces</dd></div>
            <div><dt>4</dt><dd>categories styled together</dd></div>
            <div><dt>Live</dt><dd>weather aware</dd></div>
          </dl>
        </div>
        <div className="collage">
          {HERO.map((id, i) => <Img key={id} item={BY_ID[id]} ratio="3 / 4" className={`c${i}`} />)}
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="Three steps to a finished look" />
          <div className="steps">
            {STEPS.map(([n, t, d]) => (<div key={n} className="step"><span>{n}</span><h3>{t}</h3><p>{d}</p></div>))}
          </div>
        </div>
      </section>

      <section className="wrap sect">
        <SectionHead eyebrow="From the catalog" title="Pieces that work together" sub="Clothing, footwear, makeup and jewelry, all styled as one." />
        <div className="grid4">
          {FEATURED.map((id) => (
            <Link to="/explore" key={id} className="card plain">
              <Img item={BY_ID[id]} />
              <div className="meta"><b>{BY_ID[id].name}</b><small>{BY_ID[id].cat}</small></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap sect">
        <SectionHead eyebrow="What’s inside" title="Built like a real product" />
        <div className="features">
          {FEATURES.map(([t, d]) => (<div key={t} className="feature"><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <h2>Ready to see your first look?</h2>
          <p>It takes less than a minute. No account required.</p>
          <Link to="/studio" className="btn light">Style me</Link>
        </div>
      </section>
    </>
  );
}
