import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BookCatalog from './components/BookCatalog';

/**
 * Pagina care va fi afisata pentru orice adresa necunoscuta.
 */
const NotFound = () => (
  <main style={{ padding: '60px 20px', textAlign: 'center' }}>
    <h1>404 - Pagina nu exista</h1>
    <p>
      <Link to="/">Inapoi la magazin</Link>
    </p>
  </main>
);

/**
 * Componenta radacina: defineste rutele aplicatiei.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookCatalog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
