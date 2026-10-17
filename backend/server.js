/**
 * MERN BOOKSTORE - API v1
 * Backend pentru catalogul de carti.
 *
 * Functionalitati:
 * - GET /                    - informatii despre API
 * - GET /api                 - informatii despre API
 * - GET /api/products        - produsele active
 * - filtrare dupa categorie
 * - filtrare featured=true
 * - cautare dupa titlu si autor
 * - sortare
 * - GET /api/products/:id    - un singur produs activ
 * - GET /api/categories      - lista categoriilor
 * - tratarea erorilor 400, 404 si 500
 */

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Configurare
const app = express();
const PORT = process.env.PORT || 3000;

const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const PRODUCTS_FILE = path.join(__dirname, 'data', 'books.json');

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(compression());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/**
 * Citeste catalogul complet
 */
const readCatalog = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(data);

    return {
      products: parsed.products || [],
      metadata: parsed.metadata || {},
    };
  } catch (error) {
    console.error('Eroare la citirea catalogului:', error.message);

    return {
      products: [],
      metadata: {},
    };
  }
};

/**
 * Returneaza doar produsele
 */
const readProducts = () => readCatalog().products;

/**
 * Salveaza produsele pastrand metadata
 */
const saveProducts = (products) => {
  const { metadata } = readCatalog();
  const now = new Date().toISOString();

  const data = {
    products,
    metadata: {
      ...metadata,
      totalProducts: products.length,
      lastUpdated: now,
    },
  };

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
};

/**
 * Pretul efectiv:
 * pretul redus daca exista, altfel pretul normal
 */
const effectivePrice = (product) => product.discountPrice ?? product.price;

/**
 * Variantele de sortare acceptate
 */
const SORT_OPTIONS = {
  price_asc: (a, b) => effectivePrice(a) - effectivePrice(b),
  price_desc: (a, b) => effectivePrice(b) - effectivePrice(a),
  title_asc: (a, b) => a.title.localeCompare(b.title, 'ro'),
  title_desc: (a, b) => b.title.localeCompare(a.title, 'ro'),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

/**
 * Curata valorile primite prin query string
 */
const queryText = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * GET /api/products
 *
 * Parametri optionali:
 * category=React
 * featured=true
 * search=react
 * sort=price_asc
 */
app.get('/api/products', (req, res) => {
  try {
    const category = queryText(req.query.category);
    const featured = queryText(req.query.featured);
    const search = queryText(req.query.search);
    const sort = queryText(req.query.sort);

    // Verificam daca sortarea este valida
    if (sort && !SORT_OPTIONS[sort]) {
      return res.status(400).json({
        success: false,
        message: `Sortare invalida: "${sort}"`,
        allowedSorts: Object.keys(SORT_OPTIONS),
      });
    }

    // Doar produsele active
    let products = readProducts().filter((product) => product.isActive === true);

    // Filtrare dupa categorie
    if (category) {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Doar produsele recomandate
    if (featured === 'true') {
      products = products.filter((product) => product.featured === true);
    }

    // Cautare dupa titlu sau autor
    if (search) {
      const keyword = search.toLowerCase();

      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(keyword) ||
          product.author.toLowerCase().includes(keyword)
      );
    }

    // Sortare
    if (sort) {
      products = products.toSorted(SORT_OPTIONS[sort]);
    }

    res.json({
      success: true,
      products,
      total: products.length,
      filters: {
        category: category || null,
        featured: featured || null,
        search: search || null,
        sort: sort || null,
      },
    });
  } catch (error) {
    console.error('Eroare la obtinerea produselor:', error);

    res.status(500).json({
      success: false,
      message: 'Eroare server',
    });
  }
});

/**
 * GET /api/products/:id
 */
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID invalid',
    });
  }

  const product = readProducts().find((product) => product.id === id && product.isActive === true);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produsul nu a fost gasit',
    });
  }

  res.json({
    success: true,
    product,
  });
});

/**
 * GET / si GET /api
 */
const apiInfo = (req, res) => {
  res.json({
    message: 'MERN BookStore API v1',
    description: 'API pentru catalogul de carti',
    version: '1.0.0',
    endpoints: {
      'GET /api/products': 'Toate produsele active',
      'GET /api/products?category=React': 'Filtrare dupa categorie',
      'GET /api/products?featured=true': 'Produsele recomandate',
      'GET /api/products?search=react': 'Cautare dupa titlu sau autor',
      'GET /api/products?sort=price_asc': 'Sortare dupa pret crescator',
      'GET /api/products/:id': 'Un singur produs',
      'GET /api/categories': 'Lista categoriilor',
    },
    author: 'SDBIS',
  });
};

app.get('/', apiInfo);
app.get('/api', apiInfo);

/**
 * GET /api/categories
 */
app.get('/api/categories', (req, res) => {
  const products = readProducts().filter((product) => product.isActive === true);

  const categories = products.reduce((result, product) => {
    const existing = result.find((item) => item.name === product.category);

    if (existing) {
      existing.count += 1;
    } else {
      result.push({
        name: product.category,
        count: 1,
      });
    }

    return result;
  }, []);

  res.json({
    success: true,
    categories,
  });
});

/**
 * Ruta inexistenta - 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} nu exista`,
  });
});

/**
 * Tratarea erorilor
 */
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON invalid in corpul cererii',
    });
  }

  console.error('Eroare neprevazuta:', err);

  res.status(500).json({
    success: false,
    message: 'Eroare interna a serverului',
  });
});

// Pornirea serverului
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('\nMERN BookStore API v1');
    console.log(`Serverul ruleaza pe: http://localhost:${PORT}`);
    console.log(`Produse: http://localhost:${PORT}/api/products\n`);
  });
}

module.exports = app;
