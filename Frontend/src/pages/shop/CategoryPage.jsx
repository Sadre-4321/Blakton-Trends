import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../../components/ui/ProductCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import productService from '../../services/productService';

const categoryLabels = {
  'formal-shirt': 'Formal Shirt',
  'formal-pant': 'Formal Pant',
  coat: 'Coat / Blazer',
  '2-piece': '2-Piece',
  '3-piece': '3-Piece',
  'kurta-pajama': 'Kurta Pajama',
  'shirt-pant-pair': 'Shirt + Pant Pair',
  summer: 'Summer Wear',
  winter: 'Winter Wear',
  offers: 'Offers',
};

const RELATED_LINKS = [
  { label: 'Formal Shirt', to: '/products/category/formal-shirt' },
  { label: 'Formal Pant', to: '/products/category/formal-pant' },
  { label: '2-Piece', to: '/products/category/2-piece' },
  { label: 'Coat', to: '/products/category/coat' },
  { label: '3-Piece', to: '/products/category/3-piece' },
  { label: 'Kurta', to: '/products/category/kurta-pajama' },
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const unwrap = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const CategoryPage = () => {
  const { type, category } = useParams();
  const routeType = type || category || 'formal-shirt';
  const title = categoryLabels[routeType] || routeType.replace(/-/g, ' ');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const requestParams = useMemo(() => {
    const params = { limit: 100, sort: sortBy };
    if (routeType === 'summer' || routeType === 'winter') {
      params.season = routeType;
    } else if (routeType === 'offers') {
      params.onOffer = 'true';
    } else {
      params.category = routeType;
    }
    return params;
  }, [routeType, sortBy]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await productService.getAllProducts(requestParams);
        if (!mounted) return;
        let list = unwrap(response);

        if (sortBy === 'price_asc') {
          list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'price_desc') {
          list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
        }

        setProducts(list);
      } catch (err) {
        if (mounted) {
          setProducts([]);
          setError(err.response?.data?.message || 'Unable to load products');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [requestParams, sortBy]);

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main py-5 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#878787]">
          <Link to="/" className="hover:text-[#2874f0]">Home</Link>
          <span>/</span>
          <span className="capitalize text-[#212121]">{title}</span>
        </div>

        <div className="mb-4 overflow-hidden rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-sans text-2xl font-semibold capitalize text-[#212121]">{title}</h1>
              <p className="mt-1 text-sm text-[#878787]">
                {loading ? 'Loading products...' : `${products.length} products from your Image folder`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#475569]">
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-sm border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#212121] outline-none focus:border-[#2874f0]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
            {RELATED_LINKS.map((link) => {
              const active = link.to.endsWith(`/${routeType}`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap rounded-sm border px-3 py-1.5 text-[12px] font-semibold uppercase transition ${
                    active
                      ? 'border-[#2874f0] bg-[#2874f0] text-white'
                      : 'border-[#e0e0e0] bg-white text-[#212121] hover:border-[#2874f0]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
            : products.length > 0
              ? products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))
              : (
                <div className="col-span-full rounded-sm border border-[#e0e0e0] bg-white p-10 text-center">
                  <h2 className="text-xl font-semibold text-[#212121]">No products in this category</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#878787]">
                    Try another category from the bar above, or browse all products.
                  </p>
                  <Link
                    to="/products"
                    className="mt-5 inline-flex rounded-sm bg-[#2874f0] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    View All Products
                  </Link>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
