import { useEffect, useState } from 'react';

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="back-to-top fixed right-6 bottom-6 z-50 rounded-full bg-[#1A3C5E] px-4 py-3 text-white shadow-[0_15px_35px_rgba(26,60,94,0.25)] transition duration-200 hover:bg-[#0F2840]"
      aria-label="Scroll to top"
    >
      ↑ Top
    </button>
  );
};

export default BackToTopButton;
