import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Nav, Footer } from './components.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Studio from './pages/Studio.jsx';
import Lookbook from './pages/Lookbook.jsx';

export default function App() {
  const { pathname } = useLocation();
 useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/lookbook" element={<Lookbook />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
