import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import { calculateDiscount, formatPrice } from '../../utils/helpers';
import { resolveImageUrl } from '../../utils/resolveImage';
import ProductCard from '../../components/ui/ProductCard';

const ProductDetailPage = () => {
  const { id, productId } = useParams();
  const productKey = id || productId;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedError, setRelatedError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openSection, setOpenSection] = useState('details');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await productService.getProductById(productKey);
        const data = response?.data?.data || response?.data;
        if (!mounted) return;
        if (!data) {
          setError('Product not found');
          return;
        }
        setProduct(data);
        setSelectedColor(data.color || data.colors?.[0] || '');
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Product not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (productKey) fetchProduct();
    return () => { mounted = false; };
  }, [productKey]);

  useEffect(() => {
    let mounted = true;
    const loadRelatedProducts = async () => {
      if (!product) return;
      setRelatedError('');
      try {
        const response = await productService.getAllProducts({
          category: product.category,
          limit: 8,
        });
        const payload = response?.data?.data || response?.data;
        const related = Array.isArray(payload) ? payload : [];
        if (mounted) {
          setRelatedProducts(related.filter((item) => item._id !== product._id).slice(0, 4));
        }
      } catch (err) {
        if (mounted) {
          setRelatedProducts([]);
          setRelatedError(err.response?.data?.message || 'Unable to load more products');
        }
      }
    };
    loadRelatedProducts();
    return () => { mounted = false; };
  }, [product]);

  const images = product?.images?.length
    ? product.images.map((img) => resolveImageUrl(img))
    : [resolveImageUrl(null)];
  const sizes = product?.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = Array.from(new Set(product?.colors?.length ? product.colors : (product?.color ? [product.color] : [])));
  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);
  const discount = product?.discountPercent || (originalPrice > price ? calculateDiscount(originalPrice, price) : 0);

  const stockStatus = useMemo(() => {
    const stock = product?.stock ?? 0;
    if (stock <= 0) return { label: 'Out of Stock', color: '#DC2626' };
    if (stock <= 5) return { label: `Only ${stock} left`, color: '#F59E0B' };
    return { label: 'In Stock', color: '#16A34A' };
  }, [product]);

  const ensureReady = () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/product/${productKey}`);
      return false;
    }
    if (!selectedSize) {
      setSizeError(true);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!ensureReady()) return;
    setAdding(true);
    try {
      await addToCart({ ...product, color: selectedColor }, quantity, selectedSize);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!ensureReady()) return;
    setAdding(true);
    try {
      const buyNowItem = {
        productId: product._id,
        _id: product._id,
        name: product.name,
        image: images[0],
        price: product.price,
        quantity,
        size: selectedSize,
        color: selectedColor,
      };
      sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
      await addToCart({ ...product, color: selectedColor }, quantity, selectedSize);
      navigate('/checkout?mode=buynow');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="container-main py-20 text-center text-[#878787]">Loading product...</div>;
  if (error || !product) {
    return (
      <div className="container-main py-20 text-center">
        <p className="text-red-600">{error || 'Product not found'}</p>
        <Link to="/products" className="mt-4 inline-block text-[#2874f0]">Back to shop</Link>
      </div>
    );
  }

  const detailRows = [
    ['Fabric', product.fabric || product.material || 'Cotton'],
    ['Material', product.material || product.fabric || '—'],
    ['Color', selectedColor || product.color || '—'],
    ['Fit', product.fit || 'Regular Fit'],
    ['Occasion', product.occasion || 'formal'],
    ['Piece Type', product.pieceType || 'single'],
    ['Pant Style', product.pantStyle || '—'],
    ['Delivery', product.deliveryDays || '3-5 business days'],
    ['Return Policy', `${product.returnDays || 7} days return on unused/defective items`],
    ['Refund', `Refund in ${product.refundDays || 7} working days after approval`],
    ['Seller', 'Blakton Modern Fashion Studio'],
  ];

  const sections = [
    { key: 'details', title: 'Product Details', content: product.description },
    { key: 'included', title: "What's Included", content: (product.included || []).join(', ') || 'As shown in product images' },
    { key: 'care', title: 'Materials & Care', content: product.careInstructions },
    { key: 'return', title: 'Return & Refund Policy', content: `Easy ${product.returnDays || 7}-day returns for unused/defective products. Refunds are processed within ${product.refundDays || 7} working days after pickup and quality check.` },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-16">
      <div className="container-main py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#878787]">
          <Link to="/" className="hover:text-[#2874f0]">Home</Link>
          <span>/</span>
          <Link to={`/products/category/${product.category}`} className="capitalize hover:text-[#2874f0]">
            {String(product.category || '').replace(/-/g, ' ')}
          </Link>
          <span>/</span>
          <span className="text-[#212121]">{product.name}</span>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="min-w-0 rounded-sm border border-[#e0e0e0] bg-white p-4">
            <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-sm bg-[#f5f5f5] sm:min-h-[520px]">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="max-h-[520px] w-full object-contain object-center p-4"
              />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-sm border bg-[#f8fafc] ${index === activeImage ? 'border-[#2874f0]' : 'border-[#e0e0e0]'}`}>
                  <img src={image} alt="" className="h-full w-full object-contain object-center p-1" />
                </button>
              ))}
            </div>
          </section>

          <aside className="min-w-0 rounded-sm border border-[#e0e0e0] bg-white p-5">
            {(product.onOffer || discount > 0) && (
              <span className="rounded-sm bg-[#388e3c] px-2 py-1 text-[11px] font-bold uppercase text-white">
                {product.offerBadge || `${discount}% OFF`}
              </span>
            )}
            <h1 className="mt-3 text-[22px] font-semibold leading-tight text-[#212121] sm:text-[24px]">{product.name}</h1>
            <p className="mt-2 text-sm leading-6 text-[#878787]">{product.description}</p>

            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-[28px] font-bold">{formatPrice(price)}</span>
              {originalPrice > price && (
                <>
                  <span className="text-[16px] text-[#878787] line-through">{formatPrice(originalPrice)}</span>
                  <span className="text-[14px] font-semibold text-[#388e3c]">{discount}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-[#878787]">Inclusive of all taxes · Free delivery on orders above ₹500</p>

            {colors.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[12px] uppercase tracking-wide text-[#878787]">Color</div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-sm border px-3 py-2 text-sm font-medium ${selectedColor === color ? 'border-[#2874f0] bg-[#eff6ff] text-[#2874f0]' : 'border-[#e0e0e0]'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={`mt-5 rounded-sm border p-4 ${sizeError ? 'border-red-500' : 'border-[#e0e0e0]'}`}>
              <div className="mb-3 text-[12px] uppercase tracking-wide text-[#878787]">Select Size</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`min-w-[48px] rounded-sm border px-3 py-2 text-sm font-semibold ${selectedSize === size ? 'border-[#2874f0] bg-[#2874f0] text-white' : 'border-[#e0e0e0] hover:border-[#2874f0]'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && <p className="mt-2 text-sm text-red-600">Please select a size</p>}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 rounded-sm border border-[#e0e0e0]">−</button>
              <span className="min-w-[32px] text-center font-semibold">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="h-10 w-10 rounded-sm border border-[#e0e0e0]">+</button>
              <span className="ml-2 text-sm font-medium" style={{ color: stockStatus.color }}>{stockStatus.label}</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={adding || product.stock <= 0} onClick={handleAddToCart} className="rounded-sm border border-[#2874f0] bg-white py-3 text-sm font-semibold text-[#2874f0] disabled:opacity-50">
                {adding ? 'Please wait...' : 'Add to Cart'}
              </button>
              <button type="button" disabled={adding || product.stock <= 0} onClick={handleBuyNow} className="rounded-sm bg-[#fb641b] py-3 text-sm font-semibold text-white hover:bg-[#e45712] disabled:opacity-50">
                Buy Now
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-[#e0e0e0]">
              <table className="w-full text-sm">
                <tbody>
                  {detailRows.map(([label, value]) => (
                    <tr key={label} className="border-b border-[#f0f0f0] last:border-0">
                      <td className="w-[38%] bg-[#fafafa] px-3 py-2.5 font-medium text-[#878787]">{label}</td>
                      <td className="px-3 py-2.5 capitalize text-[#212121]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 space-y-2">
              {sections.map((section) => (
                <div key={section.key} className="border-b border-[#e0e0e0] pb-2">
                  <button type="button" onClick={() => setOpenSection((c) => (c === section.key ? '' : section.key))} className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold">
                    <span>{section.title}</span>
                    <span>{openSection === section.key ? '−' : '+'}</span>
                  </button>
                  {openSection === section.key && (
                    <p className="pb-3 text-sm leading-6 text-[#878787]">{section.content}</p>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <section className="container-main pb-12" aria-labelledby="related-products-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">More from Blakton</p>
            <h2 id="related-products-heading" className="mt-1 text-xl font-semibold text-[#212121]">You may also like</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#2874f0] hover:underline">Shop all</Link>
        </div>
        {relatedError && (
          <p role="status" className="mb-3 text-sm text-red-600">{relatedError}</p>
        )}
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id || item.id} product={item} />
            ))}
          </div>
        ) : !relatedError ? (
          <p className="rounded-sm border border-[#e0e0e0] bg-white p-5 text-sm text-[#64748b]">
            More products in this collection are coming soon.
          </p>
        ) : null}
      </section>
    </div>
  );
};

export default ProductDetailPage;
