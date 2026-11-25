import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ui/ProductCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import productService from '../../services/productService';

const FILTERS = [
  { label: 'All', params: {} },
  { label: 'Offers', params: { onOffer: 'true' } },
  { label: 'Formal Shirt', params: { category: 'formal-shirt' } },
  { label: 'Formal Pant', params: { category: 'formal-pant' } },
  { label: '2-Piece', params: { category: '2-piece' } },
  { label: 'Coat', params: { category: 'coat' } },
  { label: '3-Piece', params: { category: '3-piece' } },
  { label: 'Kurta', params: { category: 'kurta-pajama' } },
  { label: 'Summer', params: { season: 'summer' } },
  { label: 'Winter', params: { season: 'winter' } },
];

const unwrap = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryParams = useMemo(() => {
    const params = {};
    ['category', 'season', 'pieceType', 'collection', 'q', 'onOffer'].forEach((key) => {
      const value = searchParams.get(key);
      if (value) params[key] = value;
    });
    params.limit = 48;
    return params;
  }, [searchParams]);

  const activeFilter = useMemo(() => {
    const category = searchParams.get('category');
    const season = searchParams.get('season');
    const onOffer = searchParams.get('onOffer');
    if (onOffer === 'true') return 'Offers';
    if (category) return FILTERS.find((f) => f.params.category === category)?.label || 'All';
    if (season) return FILTERS.find((f) => f.params.season === season)?.label || 'All';
    return 'All';
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await productService.getAllProducts(queryParams);
        if (mounted) setProducts(unwrap(response));
      } catch (error) {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [queryParams]);

  const applyFilter = (filter) => {
    const next = new URLSearchParams();
    Object.entries(filter.params).forEach(([key, value]) => next.set(key, value));
    setSearchParams(next);
  };

  const title = searchParams.get('season')
    ? `${searchParams.get('season')} Collection`
    : searchParams.get('category')
      ? String(searchParams.get('category')).replace(/-/g, ' ')
      : 'All Products';

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main py-6">
        <div className="mb-4 overflow-hidden rounded-sm border border-[#e0e0e0] bg-white p-4">
          <h1 className="font-sans text-2xl font-semibold capitalize text-[#212121]">{title}</h1>
          <p className="mt-1 text-sm text-[#878787]">
            Modern men&apos;s fashion from Blakton
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => applyFilter(filter)}
                className={`rounded-sm border px-3 py-1.5 text-[12px] font-semibold uppercase ${
                  activeFilter === filter.label
                    ? 'border-[#2874f0] bg-[#2874f0] text-white'
                    : 'border-[#e0e0e0] bg-white text-[#212121] hover:border-[#2874f0]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-[#e0e0e0] bg-white p-3">
          <div className="mb-3 px-1 text-sm text-[#878787]">
            {loading ? 'Loading...' : `${products.length} products`}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
          </div>
          {!loading && products.length === 0 && (
            <div className="py-16 text-center text-sm text-[#878787]">
              No products found. Try another filter or seed the database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
