import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createDefaultFilters,
  filterAndSortProducts,
  getCategories,
  getMaxPrice,
} from '../utils/products';
import './SearchFilterSort.css';

const SearchFilterSort = ({ products, onFilteredProducts, onServerFiltersChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = useMemo(() => getCategories(products), [products]);

  const priceLimit = useMemo(() => getMaxPrice(products), [products]);

  const [filters, setFilters] = useState(() => {
    const defaults = createDefaultFilters(priceLimit);

    const minPrice = Number(searchParams.get('minPrice') ?? defaults.minPrice);

    const maxPrice = Number(searchParams.get('maxPrice') ?? defaults.maxPrice);

    return {
      search: searchParams.get('search') ?? defaults.search,

      category: searchParams.get('category') ?? defaults.category,

      minPrice: Number.isFinite(minPrice)
        ? Math.max(0, Math.min(minPrice, priceLimit))
        : defaults.minPrice,

      maxPrice: Number.isFinite(maxPrice)
        ? Math.max(0, Math.min(maxPrice, priceLimit))
        : defaults.maxPrice,

      inStockOnly: searchParams.get('inStockOnly') === 'true',

      featuredOnly: searchParams.get('featuredOnly') === 'true',

      sortBy: searchParams.get('sortBy') ?? defaults.sortBy,
    };
  });

  /*
   * Debounce pentru cautare.
   */
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filters.search]);

  /*
   * Trimitem catre BookCatalog filtrele
   * care trebuie executate pe server.
   */
  useEffect(() => {
    onServerFiltersChange({
      search: debouncedSearch,
      category: filters.category,
      sortBy: filters.sortBy,
    });
  }, [debouncedSearch, filters.category, filters.sortBy, onServerFiltersChange]);

  /*
   * Aplicam si filtrele locale.
   * Pretul, stocul si featured raman in frontend.
   */
  const filtersForSearch = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  const filtered = useMemo(
    () => filterAndSortProducts(products, filtersForSearch),
    [products, filtersForSearch]
  );

  useEffect(() => {
    onFilteredProducts(filtered);
  }, [filtered, onFilteredProducts]);

  /*
   * Salvam filtrele in URL.
   */
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set('search', filters.search);
    }

    if (filters.category !== 'all') {
      params.set('category', filters.category);
    }

    if (filters.minPrice !== 0) {
      params.set('minPrice', String(filters.minPrice));
    }

    if (filters.maxPrice !== priceLimit) {
      params.set('maxPrice', String(filters.maxPrice));
    }

    if (filters.inStockOnly) {
      params.set('inStockOnly', 'true');
    }

    if (filters.featuredOnly) {
      params.set('featuredOnly', 'true');
    }

    if (filters.sortBy !== 'name') {
      params.set('sortBy', filters.sortBy);
    }

    setSearchParams(params, {
      replace: true,
    });
  }, [filters, priceLimit, setSearchParams]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFilters((prev) => ({
      ...prev,

      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMinPrice = (e) => {
    const value = Number(e.target.value);

    setFilters((prev) => ({
      ...prev,

      minPrice: Math.min(value, prev.maxPrice),
    }));
  };

  const handleMaxPrice = (e) => {
    const value = Number(e.target.value);

    setFilters((prev) => ({
      ...prev,

      maxPrice: Math.max(value, prev.minPrice),
    }));
  };

  const resetFilters = () => {
    setFilters(createDefaultFilters(priceLimit));
  };

  return (
    <section className="search-filter-container" aria-label="Cautare si filtrare">
      <div className="filters-row">
        <div className="filter-group search-group">
          <label htmlFor="search" className="filter-label">
            Cautare
          </label>

          <input
            id="search"
            name="search"
            type="search"
            placeholder="Titlu, autor, descriere..."
            value={filters.search}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category" className="filter-label">
            Categorie
          </label>

          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="filter-input"
          >
            <option value="all">Toate categoriile</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group price-group">
          <span className="filter-label">
            Pret: {filters.minPrice} - {filters.maxPrice} RON
          </span>

          <input
            type="range"
            min="0"
            max={priceLimit}
            value={filters.minPrice}
            onChange={handleMinPrice}
            aria-label="Pret minim"
            className="range-input"
          />

          <input
            type="range"
            min="0"
            max={priceLimit}
            value={filters.maxPrice}
            onChange={handleMaxPrice}
            aria-label="Pret maxim"
            className="range-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy" className="filter-label">
            Sortare
          </label>

          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="filter-input"
          >
            <option value="name">Titlu (A-Z)</option>

            <option value="author">Autor (A-Z)</option>

            <option value="price-low">Pret (mic - mare)</option>

            <option value="price-high">Pret (mare - mic)</option>

            <option value="rating">Evaluare</option>

            <option value="newest">Cele mai noi</option>
          </select>
        </div>
      </div>

      <div className="filters-row quick-filters">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="inStockOnly"
            checked={filters.inStockOnly}
            onChange={handleChange}
          />
          Doar in stoc
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="featuredOnly"
            checked={filters.featuredOnly}
            onChange={handleChange}
          />
          Doar recomandate
        </label>

        <button type="button" className="clear-filters-btn" onClick={resetFilters}>
          Reseteaza filtrele
        </button>
      </div>
    </section>
  );
};

export default SearchFilterSort;
