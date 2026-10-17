import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ProductCard from './ProductCard';
import SearchFilterSort from './SearchFilterSort';
import './BookCatalog.css';

const SORT_MAP = {
  name: 'title_asc',
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  newest: 'newest',
};

const BookCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [serverFilters, setServerFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'name',
  });

  const handleServerFiltersChange = useCallback((nextFilters) => {
    setServerFilters((previousFilters) => {
      const sameFilters =
        previousFilters.search === nextFilters.search &&
        previousFilters.category === nextFilters.category &&
        previousFilters.sortBy === nextFilters.sortBy;

      return sameFilters ? previousFilters : nextFilters;
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setError(null);

      try {
        const params = {};

        const search = serverFilters.search.trim();

        if (search) {
          params.search = search;
        }

        if (serverFilters.category !== 'all') {
          params.category = serverFilters.category;
        }

        const serverSort = SORT_MAP[serverFilters.sortBy];

        if (serverSort) {
          params.sort = serverSort;
        }

        const response = await axios.get(`${API_URL}/api/products`, {
          params,
          signal: controller.signal,
        });

        if (response.data.success) {
          const list = response.data.products ?? [];

          setProducts(list);
          setFilteredProducts(list);
        } else {
          setError(response.data.message || 'Eroare la incarcarea produselor');
        }
      } catch (error) {
        if (error.name === 'CanceledError') {
          return;
        }

        setError('Eroare la incarcarea produselor');

        console.error('Eroare la obtinerea produselor:', error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [reloadKey, serverFilters]);

  if (loading) {
    return <div className="loading">Se incarca produsele...</div>;
  }

  if (error) {
    return (
      <div className="error" role="alert">
        <p>{error}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          Reincarca
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span>MERN BookStore</span>

            <span className="version-badge">E-Commerce</span>
          </div>
        </div>
      </header>

      <main>
        <SearchFilterSort
          products={products}
          onFilteredProducts={setFilteredProducts}
          onServerFiltersChange={handleServerFiltersChange}
        />

        <p className="results-count" aria-live="polite">
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'produs gasit' : 'produse gasite'}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <h2>Nu sunt produse disponibile</h2>

            <p>
              {products.length > 0
                ? 'Niciun produs nu corespunde filtrelor. Modificati criteriile de cautare.'
                : 'Niciun produs nu corespunde cautarii.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookCatalog;
