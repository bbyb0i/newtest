import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/Index';
import ArtistPage from './pages/Artist';
import NotFound from './pages/NotFound';

/**
 * Top level component responsible for routing. It delegates rendering to
 * individual page components based on the current URL. If no route
 * matches, the NotFound page is shown. The BrowserRouter must wrap
 * everything that relies on the React Router context.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/artist/:artistId" element={<ArtistPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;