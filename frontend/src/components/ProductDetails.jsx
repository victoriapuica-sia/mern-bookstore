import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL, PLACEHOLDER_IMAGE } from '../config';
import { formatPrice, discountPercent } from '../utils/products';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`, {
          signal: controller.signal,
        });

        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError('Produsul nu a fost gasit');
        }
      } catch (error) {
        if (error.name === 'CanceledError') return;

        if (error.response?.status === 404) {
          setError('Produsul nu a fost gasit');
        } else {
          setError('Eroare la incarcarea produsului');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <div className="product-details-message">Se incarca produsul...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-details-message">
        <h1>404 - Produs negasit</h1>
        <p>{error}</p>

        <Link to="/" className="back-link">
          Inapoi la magazin
        </Link>
      </div>
    );
  }

  const discount = discountPercent(product);

  return (
    <main className="product-details-page">
      <Link to="/" className="back-link">
        ← Inapoi la catalog
      </Link>

      <div className="product-details-card">
        <div className="product-details-image-container">
          <img
            src={product.imageUrl || PLACEHOLDER_IMAGE}
            alt={`Coperta cartii ${product.title}`}
            className="product-details-image"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>

        <div className="product-details-info">
          <p className="product-details-category">{product.category}</p>

          <h1>{product.title}</h1>

          <p className="product-details-author">de {product.author}</p>

          <div className="product-details-price">
            {discount > 0 ? (
              <>
                <span className="original-price">{formatPrice(product.price)}</span>

                <span className="current-price">{formatPrice(product.discountPrice)}</span>

                <span className="discount-details">-{discount}%</span>
              </>
            ) : (
              <span className="current-price">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="product-details-description">{product.description}</p>

          <dl className="product-details-specifications">
            <dt>ISBN</dt>
            <dd>{product.isbn || 'N/A'}</dd>

            <dt>Editura</dt>
            <dd>{product.specifications?.publisher || 'N/A'}</dd>

            <dt>Pagini</dt>
            <dd>{product.specifications?.pages || 'N/A'}</dd>

            <dt>An publicare</dt>
            <dd>{product.specifications?.year || 'N/A'}</dd>

            <dt>Stoc</dt>
            <dd>{product.stock} bucati</dd>

            <dt>Evaluare</dt>
            <dd>
              {product.rating || 0} / 5 ({product.reviewCount || 0} recenzii)
            </dd>
          </dl>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
