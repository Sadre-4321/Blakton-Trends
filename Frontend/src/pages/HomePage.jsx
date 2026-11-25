import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Scissors,
  ShieldCheck,
  Truck,
  Award,
} from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import productService from '../services/productService';
import { CATEGORY_COVER_IMAGES } from '../constants/productImages';
import { resolveImageUrl } from '../utils/resolveImage';

const HOME_SECTIONS = [
  { key: 'formal-shirt', title: 'Formal Shirts', subtitle: 'Office & occasion shirts', viewAll: '/products/category/formal-shirt', params: { category: 'formal-shirt', limit: 8 } },
  { key: 'formal-pant', title: 'Formal Pants', subtitle: 'Straight · Bootcut · Baggy · Slim', viewAll: '/products/category/formal-pant', params: { category: 'formal-pant', limit: 8 } },
  { key: '2-piece', title: '2-Piece Sets', subtitle: 'Shirt + Pant pairs', viewAll: '/products/category/2-piece', params: { category: '2-piece', limit: 8 } },
  { key: 'coat', title: 'Coats & Blazers', subtitle: 'Coat only collection', viewAll: '/products/category/coat', params: { category: 'coat', limit: 8 } },
  { key: '3-piece', title: '3-Piece Suits', subtitle: 'Shirt + Pant + Coat + Waistcoat', viewAll: '/products/category/3-piece', params: { category: '3-piece', limit: 8 } },
  { key: 'kurta-pajama', title: 'Kurta Pajama', subtitle: 'Wedding & festive wear', viewAll: '/products/category/kurta-pajama', params: { category: 'kurta-pajama', limit: 8 } },
  { key: 'summer', title: 'Summer — Singles & Pairs', subtitle: 'Lightweight summer wear', viewAll: '/products?season=summer', params: { season: 'summer', limit: 8 } },
  { key: 'winter', title: 'Winter — Singles & Pairs', subtitle: 'Warm winter formal wear', viewAll: '/products?season=winter', params: { season: 'winter', limit: 8 } },
];

const SHOP_BY_LOOK = [
  { label: 'Formal Shirt', to: '/products/category/formal-shirt', image: CATEGORY_COVER_IMAGES['formal-shirt'], caption: 'Crisp collars. Daily polish.' },
  { label: 'Formal Pant', to: '/products/category/formal-pant', image: CATEGORY_COVER_IMAGES['formal-pant'], caption: 'Bootcut · Baggy · Straight' },
  { label: '2-Piece', to: '/products/category/2-piece', image: CATEGORY_COVER_IMAGES['2-piece'], caption: 'Matched shirt + pant sets' },
  { label: 'Coat', to: '/products/category/coat', image: CATEGORY_COVER_IMAGES.coat, caption: 'Blazers built to last' },
  { label: '3-Piece', to: '/products/category/3-piece', image: CATEGORY_COVER_IMAGES['3-piece'], caption: 'Full suit presence' },
  { label: 'Kurta', to: '/products/category/kurta-pajama', image: CATEGORY_COVER_IMAGES['kurta-pajama'], caption: 'Festive & wedding ready' },
];

const HERO_IMAGES = {
  sageSuit: '/Brand/hero-sage-suit.png',
  sageBlazer: '/Brand/hero-sage-blazer.png',
  blueSuit: '/Brand/hero-blue-suit.png',
  beigeSuit: '/Brand/hero-beige-suit.png',
};

const LOOKBOOK_IMAGES = [
  HERO_IMAGES.sageSuit,
  HERO_IMAGES.sageBlazer,
  HERO_IMAGES.blueSuit,
  HERO_IMAGES.beigeSuit,
];

const HERO_SLIDES = [
  {
    title: 'Modern style, tailored for you',
    text: 'Discover premium suits, blazers and coordinated looks from Blakton.',
    image: HERO_IMAGES.sageSuit,
    cta: { label: 'Explore Suits', to: '/products/category/3-piece' },
  },
  {
    title: 'Presence in every detail',
    text: 'Statement suits and refined occasion wear made for memorable moments.',
    image: HERO_IMAGES.blueSuit,
    cta: { label: 'Shop Suits', to: '/products/category/3-piece' },
  },
  {
    title: 'Quiet confidence, perfect fit',
    text: 'Explore sophisticated modern tailoring in elegant neutral tones.',
    image: HERO_IMAGES.beigeSuit,
    cta: { label: 'Shop Collection', to: '/products' },
  },
];

const ATELIER_POSTER = '/Brand/hero-blue-suit.png';

const unwrap = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const HomePage = () => {
  const [offers, setOffers] = useState([]);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [offerRes, ...sectionResults] = await Promise.all([
          productService.getOfferProducts({ limit: 8 }).catch(() => null),
          ...HOME_SECTIONS.map((section) => productService.getAllProducts(section.params).catch(() => null)),
        ]);
        if (!mounted) return;
        setOffers(unwrap(offerRes));
        const next = {};
        HOME_SECTIONS.forEach((section, index) => {
          next[section.key] = unwrap(sectionResults[index]);
        });
        setSections(next);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((c) => (c + 1) % HERO_SLIDES.length), 5200);
    return () => clearInterval(timer);
  }, []);

  const hero = useMemo(() => HERO_SLIDES[heroIndex], [heroIndex]);
  const marqueeImages = useMemo(() => [...LOOKBOOK_IMAGES, ...LOOKBOOK_IMAGES], []);

  return (
    <div className="min-h-screen bg-[#0c1220] font-sans text-[#212121]">
      {/* Full-bleed hero — brand first, one composition */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[#0c1220] text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={hero.image}
              alt="Formal menswear look"
              className="h-full w-full object-contain object-center"
            />
            {/* Soft side wash so full face+outfit stays readable with text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/88 via-[#070b14]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/70 via-transparent to-[#070b14]/25" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <div className="container-main flex flex-1 flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-24 sm:pt-20">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-[13px] font-semibold uppercase tracking-[0.35em] text-[#c8d4e8] sm:text-[14px]"
              style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
            >
              Blakton Modern Fashion Studio
            </motion.p>

            <motion.h1
              key={`h-${heroIndex}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.65 }}
              className="mt-4 max-w-3xl text-[40px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[56px] lg:text-[64px]"
              style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
            >
              {hero.title}
            </motion.h1>

            <motion.p
              key={`p-${heroIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 max-w-lg text-[15px] leading-7 text-white/80 sm:text-[17px]"
            >
              {hero.text}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to={hero.cta.to}
                className="inline-flex items-center gap-2 bg-[#e8a23a] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-[#141414] transition hover:bg-[#f0b356]"
              >
                {hero.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/customize-order"
                className="inline-flex items-center gap-2 border border-white/35 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
              >
                Customize Order
              </Link>
            </motion.div>

            <div className="mt-10 flex gap-2">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  onClick={() => setHeroIndex(index)}
                  className={`h-1 transition-all ${heroIndex === index ? 'w-10 bg-[#e8a23a]' : 'w-5 bg-white/35'}`}
                />
              ))}
            </div>
          </div>

          <motion.a
            href="#lookbook"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-white/70"
          >
            Scroll
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </motion.a>
        </div>
      </section>

      {/* Moving lookbook strip — scroll magnet */}
      <section id="lookbook" className="overflow-hidden bg-[#101828] py-8">
        <div className="mb-5 flex items-end justify-between px-4 sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e8a23a]">Live lookbook</p>
            <h2
              className="mt-1 text-[22px] font-semibold text-white sm:text-[28px]"
              style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
            >
              Real stitches. Real presence.
            </h2>
          </div>
          <Link to="/products" className="hidden text-sm font-semibold text-white/80 hover:text-white sm:inline-flex sm:items-center sm:gap-1">
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative">
          <motion.div
            className="flex w-max gap-3"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
          >
            {marqueeImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-[220px] w-[160px] shrink-0 overflow-hidden bg-[#1a2336] sm:h-[280px] sm:w-[200px]"
              >
                <img src={src} alt="Menswear look" className="h-full w-full object-cover object-top" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Atelier video + story */}
      <section className="relative overflow-hidden bg-[#0c1220]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <img
              src={ATELIER_POSTER}
              alt="Blakton modern suit collection"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#0c1220]/35" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Blakton lookbook
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-12 text-white sm:px-10 lg:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e8a23a]">Why customers stay</p>
            <h2
              className="mt-3 text-[30px] font-semibold leading-tight sm:text-[36px]"
              style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
            >
              Offline trust.<br />Online convenience.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-white/75">
              Every shirt, pant, coat and suit is stitched in-house. Browse listed designs, or customize your own — delivered in about a week.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Scissors, title: 'Modern tailoring', text: 'Premium cuts, sharp finishing and occasion-ready fits.' },
                { icon: Award, title: 'Occasion-ready fits', text: 'Office, wedding, party — one shop for formals.' },
                { icon: ShieldCheck, title: '7-day return comfort', text: 'Order with confidence on unused / defective items.' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 text-[#e8a23a]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-[13px] text-white/65">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products?onOffer=true"
                className="inline-flex items-center gap-2 bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-[#0c1220]"
              >
                View Offers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/customize-order"
                className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-white"
              >
                Start Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by look — large image panels */}
      <section className="bg-[#f4f1ec] py-10 sm:py-14">
        <div className="container-main">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7350]">Shop by look</p>
              <h2
                className="mt-1 text-[26px] font-semibold text-[#171717] sm:text-[32px]"
                style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
              >
                Find your next formal
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[#6b6460]">
              Tap a look — only that category opens with every design from our Image collection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {SHOP_BY_LOOK.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  to={item.to}
                  className="group relative block aspect-[3/4] overflow-hidden bg-[#ddd6cb]"
                >
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.label}
                    className="h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[15px] font-semibold sm:text-[17px]">{item.label}</p>
                    <p className="mt-1 text-[12px] text-white/75">{item.caption}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#e8a23a] opacity-0 transition group-hover:opacity-100">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customize CTA — visual */}
      <section className="relative overflow-hidden bg-[#1a2336]">
        <img
          src="/Brand/hero-sage-blazer.png"
          alt="Blakton modern tailoring"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2336] via-[#1a2336]/90 to-[#1a2336]/55" />
        <div className="container-main relative z-10 flex flex-col gap-5 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#e8a23a]">Personal stitching</p>
            <h2
              className="mt-2 text-[28px] font-semibold sm:text-[34px]"
              style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
            >
              Don&apos;t see your exact design?
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-white/75">
              Tell us shirt, pant, coat or kurta details — color, fit, length — and we’ll stitch it for you. Advance via UPI.
            </p>
          </div>
          <Link
            to="/customize-order"
            className="inline-flex items-center gap-2 self-start bg-[#e8a23a] px-6 py-3.5 text-[12px] font-bold uppercase tracking-wide text-[#141414] transition hover:bg-[#f0b356]"
          >
            Customize Your Order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Product commerce sections */}
      <div className="bg-[#f1f3f6]">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          className="container-main py-6"
        >
          <div className="overflow-hidden border border-[#e8ecf1] bg-white">
            <div className="flex items-center justify-between border-b border-[#f0f2f5] px-4 py-4 sm:px-5">
              <div>
                <h2 className="font-sans text-[20px] font-semibold tracking-tight text-[#111827] sm:text-[22px]">Today&apos;s Offers</h2>
                <p className="mt-0.5 text-[12px] text-[#6b7280]">Live discounts on stitched formals</p>
              </div>
              <Link to="/products?onOffer=true" className="inline-flex items-center gap-1 bg-[#2874f0] px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#1f5fd0]">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 sm:p-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : offers.length
                  ? offers.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                  : <div className="col-span-full py-10 text-center text-sm text-[#878787]">No active offers right now.</div>}
            </div>
          </div>
        </motion.section>

        {HOME_SECTIONS.map((section) => {
          const products = sections[section.key] || [];
          return (
            <motion.section
              key={section.key}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="container-main py-3"
            >
              <div className="overflow-hidden border border-[#e8ecf1] bg-white">
                <div className="flex items-center justify-between border-b border-[#f0f2f5] px-4 py-4 sm:px-5">
                  <div>
                    <h2 className="font-sans text-[18px] font-semibold tracking-tight text-[#111827] sm:text-[20px]">{section.title}</h2>
                    <p className="mt-0.5 text-[12px] text-[#6b7280]">{section.subtitle}</p>
                  </div>
                  <Link to={section.viewAll} className="inline-flex items-center gap-1 bg-[#2874f0] px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#1f5fd0]">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 sm:p-4">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`${section.key}-${i}`} />)
                    : products.length
                      ? products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))
                      : <div className="col-span-full py-8 text-center text-sm text-[#878787]">No products yet in this collection.</div>}
                </div>
              </div>
            </motion.section>
          );
        })}

        <section className="container-main py-8">
          <div className="grid gap-4 border border-[#e8ecf1] bg-white p-5 sm:grid-cols-3">
            {[
              { icon: Award, title: 'Modern fashion studio', text: 'Contemporary menswear with Blakton style' },
              { icon: ShieldCheck, title: '7 Days Return', text: 'Easy returns on unused/defective items' },
              { icon: Truck, title: 'In-house Stitching', text: 'Shirts, pants, coats & full suits' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#eff6ff] text-[#2874f0]">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{item.title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
