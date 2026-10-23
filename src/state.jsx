import { createContext, useContext, useEffect, useState } from 'react';
import { BY_ID, STARTER } from './data/catalog.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export function AppProvider({ children }) {
  const [ids, setIds] = useState(() => read('muse.closet', STARTER));
  const [custom, setCustom] = useState([]);
  const [profile, setProfile] = useState(() => read('muse.profile', { tone: 2, under: 'warm' }));
  const [saved, setSaved] = useState(() => read('muse.looks', []));
  useEffect(() => write('muse.closet', ids), [ids]);
  useEffect(() => write('muse.profile', profile), [profile]);
  useEffect(() => write('muse.looks', saved), [saved]);
  const closet = [...custom, ...ids.map((id) => BY_ID[id]).filter(Boolean)];
  const value = {
    closet, ids, custom, profile, setProfile, saved,
    toggle: (id) => setIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id])),
    addCustom: (item) => setCustom((c) => [item, ...c]),
    removeCustom: (id) => setCustom((c) => c.filter((x) => x.id !== id)),
    saveLook: (look) => setSaved((s) => [look, ...s].slice(0, 24)),
    deleteLook: (i) => setSaved((s) => s.filter((_, n) => n !== i)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
