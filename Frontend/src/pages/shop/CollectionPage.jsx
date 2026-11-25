import { Link } from 'react-router-dom';

const CollectionPage = () => (
  <div className="min-h-screen bg-light">
    <div className="container-main section-padding">
      <div className="mb-10">
        <h1 className="font-serif text-5xl font-bold">The Collection</h1>
        <p className="text-muted mt-4 max-w-2xl">Explore our curated premium collection of tailored outfits, designed for modern occasions and timeless styling.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: 'Everyday Tailoring', description: 'Smart everyday styles in breathable fabrics.' },
          { title: 'Premium Festive', description: 'Structured silhouettes with luxurious detailing.' },
          { title: 'Formal Classics', description: 'Sharpened looks for boardrooms and events.' },
        ].map((item) => (
          <div key={item.title} className="card p-8 hover:-translate-y-2 transition-transform duration-300">
            <h2 className="text-2xl font-semibold mb-3">{item.title}</h2>
            <p className="text-muted leading-relaxed">{item.description}</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-secondary font-semibold hover:text-accent">
              Browse styles →
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CollectionPage;
