import { Link } from 'react-router-dom';

const BestSellersPage = () => (
  <div className="min-h-screen bg-light">
    <div className="container-main section-padding">
      <div className="mb-10">
        <h1 className="font-serif text-5xl font-bold">Best Sellers</h1>
        <p className="text-muted mt-4 max-w-2xl">Discover our most loved products that customers keep buying again and again.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {[
          { name: 'Satin Embroidered Kurta', price: 3299 },
          { name: 'Tailored Formal Set', price: 2899 },
          { name: 'Velvet Party Shirt', price: 2199 },
        ].map((product) => (
          <div key={product.name} className="product-card group">
            <div className="product-glow" />
            <div className="overflow-hidden rounded-[1.75rem] bg-slate-200 h-64">
              <img src={`https://picsum.photos/seed/best-${product.name.replace(/\s+/g, '-')}/800/900`} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <span className="text-secondary font-semibold">Top pick</span>
              <h2 className="mt-4 text-2xl font-semibold">{product.name}</h2>
              <p className="mt-4 text-muted">₹{product.price.toLocaleString('en-IN')}</p>
              <Link to="/products" className="mt-6 inline-flex items-center text-primary font-semibold hover:text-secondary">
                Shop now →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BestSellersPage;
