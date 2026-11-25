import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { calculateDiscount, formatPrice } from '../../utils/helpers';
import { resolveImageUrl } from '../../utils/resolveImage';

const ProductCard = ({ product }) => {
  const id = product._id || product.id;
  const image = resolveImageUrl(product.images?.[0] || product.image);
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const colors = Array.from(new Set(product.colors?.length ? product.colors : (product.color ? [product.color] : [])));
  const discount = product.discountPercent
    || (originalPrice > price ? calculateDiscount(originalPrice, price) : 0);
  const badge = product.offerBadge || product.occasion || product.category || '';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="h-full"
    >
      <Link
        to={`/product/${id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e8ecf1] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition duration-300 hover:border-[#c9d7f2] hover:shadow-[0_16px_40px_rgba(15,39,68,0.12)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f4f6]">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain object-center p-2 transition duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
            }}
          />
          {discount > 0 && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-[#16a34a] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a93a3]">
            {String(badge).replace(/-/g, ' ')}
          </p>
          <h3 className="line-clamp-2 min-h-[42px] font-sans text-[14px] font-medium leading-5 text-[#1f2937] transition group-hover:text-[#1f5fd0]">
            {product.name}
          </h3>
          <p className="line-clamp-1 text-[12px] text-[#64748b]">
            Color: {colors.length ? colors.join(', ') : 'See product details'}
          </p>

          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-[16px] font-bold text-[#111827]">{formatPrice(price)}</span>
            {originalPrice > price && (
              <>
                <span className="text-[13px] text-[#9ca3af] line-through">{formatPrice(originalPrice)}</span>
                <span className="text-[12px] font-semibold text-[#16a34a]">{discount}% off</span>
              </>
            )}
          </div>

          <span className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[#2874f0] px-3 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-white transition duration-200 group-hover:bg-[#1f5fd0]">
            <ShoppingBag className="h-3.5 w-3.5" />
            View Details
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
