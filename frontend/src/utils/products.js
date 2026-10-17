/**
 * Functii utilitare pentru produse.
 *
 * Primesc date, returneaza date noi, nu modifica nimic si nu depind de React.
 */

// Formatorul de pret se creeaza o singura data
const priceFormatter = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'RON',
});

/**
 * Pretul efectiv: pret redus, daca exista, altfel pretul standard.
 */
export const effectivePrice = (product) => product.discountPrice ?? product.price;

/**
 * Formateaza un pret dupa regulile din Romania.
 */
export const formatPrice = (value) => priceFormatter.format(value);

/**
 * Procentul de reducere, rotunjit.
 */
export const discountPercent = (product) => {
  const { price, discountPrice } = product;

  if (discountPrice === null || discountPrice >= price) return 0;

  return Math.round((1 - discountPrice / price) * 100);
};

/**
 * Lista categoriilor distincte, sortata alfabetic.
 */
export const getCategories = (products) =>
  [...new Set(products.map((p) => p.category))].toSorted((a, b) => a.localeCompare(b, 'ro'));

/**
 * Cel mai mare pret efectiv din catalog, rotunjit in sus.
 */
export const getMaxPrice = (products) => Math.ceil(Math.max(0, ...products.map(effectivePrice)));

/**
 * Filtrele implicite.
 */
export const createDefaultFilters = (maxPrice) => ({
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice,
  inStockOnly: false,
  featuredOnly: false,
  sortBy: 'name',
});

/**
 * Functiile de comparare pentru fiecare optiune de sortare.
 */
const COMPARATORS = {
  name: (a, b) => a.title.localeCompare(b.title, 'ro'),
  author: (a, b) => a.author.localeCompare(b.author, 'ro'),

  'price-low': (a, b) => effectivePrice(a) - effectivePrice(b),

  'price-high': (a, b) => effectivePrice(b) - effectivePrice(a),

  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),

  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

/**
 * Aplica toate filtrele si sortarea asupra listei de produse.
 * Returneaza un tablou NOU; tabloul primit ramane neschimbat.
 */
export const filterAndSortProducts = (products, filters) => {
  const keyword = filters.search.trim().toLowerCase();

  return products
    .filter((p) => {
      // 1. Cautare in titlu, autor si descriere
      const matchesSearch =
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.author.toLowerCase().includes(keyword) ||
        (p.description ?? '').toLowerCase().includes(keyword);

      // 2. Categorie
      const matchesCategory = filters.category === 'all' || p.category === filters.category;

      // 3. Interval de pret
      const price = effectivePrice(p);
      const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;

      // 4. Filtre rapide
      const matchesStock = !filters.inStockOnly || p.stock > 0;

      const matchesFeatured = !filters.featuredOnly || p.featured === true;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesFeatured;
    })
    .toSorted(COMPARATORS[filters.sortBy] ?? COMPARATORS.name);
};
