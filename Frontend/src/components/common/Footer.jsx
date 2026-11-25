import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.3 3.5A2.3 2.3 0 1 1 5.3 8.1a2.3 2.3 0 0 1 0-4.6ZM3.4 9.5h3.8V21H3.4V9.5Zm6.2 0h3.6v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-3.8v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21H9.6V9.5Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.7V7.1c0-.8.5-1 1-1h2.6V2.2c-.5-.1-2-.2-3.8-.2C10.9 2 9 3.7 9 6.8v1.9H6v4.1h3V22h4.1v-9.2h3.4l.5-4.1H13Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/blakton-trends/',
    icon: LinkedInIcon,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/blakton_trends?jplx=MTdlNHVybWV2eXd6eg==',
    icon: InstagramIcon,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1Gw5i7X3wT/',
    icon: FacebookIcon,
  },
];

const Footer = () => (
  <footer className="bg-[#0F2840] text-white">
    <div className="container-main section-padding">
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="space-y-4">
          <img
            src="/Brand/blakton-logo.jpg"
            alt="Blakton"
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <h3 className="font-serif text-2xl font-semibold">BLAKTON</h3>
            <p className="mt-3 text-sm text-[#CBD5E1]">
              Modern men&apos;s fashion — suits, blazers, shirts, pants and occasion wear.
            </p>
            <div className="mt-4 space-y-2 text-sm text-[#CBD5E1]">
              <a href="mailto:blakton.officila@gmail.com" className="block transition hover:text-white">blakton.officila@gmail.com</a>
              <a href="https://wa.me/917366062084" target="_blank" rel="noreferrer" className="block transition hover:text-white">WhatsApp: +91 73660 62084</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit Blakton on ${label}`}
                title={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-[#D97706] hover:text-white"
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-white">Quick Links</h4>
          <ul className="mt-5 space-y-3 text-sm text-[#CBD5E1]">
            <li>
              <Link to="/" className="hover:text-[#D97706] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[#D97706] transition-colors">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/auth/login" className="hover:text-[#D97706] transition-colors">
                Login
              </Link>
            </li>
            <li>
              <Link to="/auth/register" className="hover:text-[#D97706] transition-colors">
                Register
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-white">Customer Links</h4>
          <ul className="mt-5 space-y-3 text-sm text-[#CBD5E1]">
            <li>
              <Link to="/wishlist" className="hover:text-[#D97706] transition-colors">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-[#D97706] transition-colors">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/my-orders" className="hover:text-[#D97706] transition-colors">
                Orders
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-[#D97706] transition-colors">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-white">Support</h4>
          <ul className="mt-5 space-y-3 text-sm text-[#CBD5E1]">
            <li>
              <Link to="/privacy" className="hover:text-[#D97706] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-[#D97706] transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-[#D97706] transition-colors">
                Returns Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-[#94A3B8]">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        Blakton. All rights reserved.
      </div>
    </div>
    <a
      href="https://wa.me/917366062084"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Blakton on WhatsApp"
      title="WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition hover:scale-105 hover:bg-[#20bd5a]"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2} />
    </a>
  </footer>
);

export default Footer;
