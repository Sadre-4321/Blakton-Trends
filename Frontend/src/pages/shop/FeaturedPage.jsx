import { Link } from 'react-router-dom';

const FeaturedPage = () => (
  <div className="min-h-screen bg-light">
    <div className="container-main section-padding">
      <div className="mb-10">
        <h1 className="font-serif text-5xl font-bold">Featured Collections</h1>
        <p className="text-muted mt-4 max-w-2xl">Browse our highlighted collections that combine premium fabrics and confident style.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { label: 'Regular Wear', description: 'Comfort-driven everyday style.' },
          { label: 'Party Wear', description: 'Bold looks for evening events.' },
          { label: 'Wedding Wear', description: 'Luxurious styling for celebrations.' },
          { label: 'Formal Wear', description: 'Sharp outfits for professional settings.' },
        ].map((item) => (
          <div key={item.label} className="card p-8 hover:-translate-y-2 transition-transform duration-300">
            <h2 className="text-3xl font-semibold mb-3">{item.label}</h2>
            <p className="text-muted leading-relaxed">{item.description}</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-secondary font-semibold hover:text-accent">
              Explore collection →
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FeaturedPage;
