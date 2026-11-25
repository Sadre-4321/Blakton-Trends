import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ui/ProductCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import productService from '../../services/productService';

const SUGGESTIONS = [
  'shirt',
  'white shirt',
  'formal pant',
  'bootcut pant',
  'baggy pant',
  'coat',
  '2 piece',
  '3 piece',
  'wedding',
  'kurta',
  'navy',
];

const unwrap = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const matchLabel = (matchType, query) => {
  if (!query) return 'Showing products';
  if (matchType === 'exact') return `Results for "${query}"`;
  if (matchType === 'category') return `Showing related products for "${query}"`;
  if (matchType === 'related') return `Closest matches for "${query}"`;
  if (matchType === 'popular') return `Popular picks while we expand "${query}"`;
  return `Results for "${query}"`;
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ matchType: 'all', filters: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = queryFromUrl
          ? await productService.searchProducts(queryFromUrl, { limit: 48 })
          : await productService.getAllProducts({ limit: 48 });
        if (!mounted) return;
        setProducts(unwrap(response));
        setMeta(response?.data?.meta || { matchType: 'all', filters: {} });
      } catch {
        if (mounted) {
          setProducts([]);
          setMeta({ matchType: 'all', filters: {} });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [queryFromUrl]);

  const filtersText = useMemo(() => {
    const parts = [];
    if (meta?.filters?.category) parts.push(String(meta.filters.category).replace(/-/g, ' '));
    if (meta?.filters?.color) parts.push(meta.filters.color);
    if (meta?.filters?.pantStyle) parts.push(meta.filters.pantStyle);
    if (meta?.filters?.occasion) parts.push(meta.filters.occasion);
    return parts.join(' · ');
  }, [meta]);

  const submitSearch = (value) => {
    const q = String(value || '').trim();
    if (!q) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q });
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main py-5 sm:py-6">
        <div className="mb-4 rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(inputValue);
            }}
            className="flex overflow-hidden rounded-md border border-[#dbe3ef]"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search shirt, white shirt, bootcut pant, coat, wedding..."
              className="w-full px-4 py-3 text-sm text-[#212121] outline-none"
            />
            <button type="submit" className="bg-[#2874f0] px-5 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setInputValue(item);
                  submitSearch(item);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                  queryFromUrl.toLowerCase() === item
                    ? 'border-[#2874f0] bg-[#eff6ff] text-[#1f5fd0]'
                    : 'border-[#e0e0e0] bg-[#f8fafc] text-[#475569] hover:border-[#2874f0]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-semibold text-[#212121]">
              {matchLabel(meta.matchType, queryFromUrl)}
            </h1>
            <p className="mt-1 text-sm text-[#878787]">
              {loading ? 'Searching...' : `${products.length} products`}
              {filtersText ? ` · Matched: ${filtersText}` : ''}
              {meta.matchType === 'category' || meta.matchType === 'related'
                ? ' · Showing closest available items'
                : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
              ? products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))
              : (
                <div className="col-span-full rounded-sm border border-[#e0e0e0] bg-white p-10 text-center">
                  <h2 className="text-xl font-semibold text-[#212121]">No products available</h2>
                  <p className="mt-2 text-sm text-[#878787]">Try shirt, pant, coat, 2 piece or kurta.</p>
                  <Link to="/products" className="mt-5 inline-flex rounded-sm bg-[#2874f0] px-5 py-2.5 text-sm font-semibold text-white">
                    Browse all products
                  </Link>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
