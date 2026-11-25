const SkeletonCard = () => (
  <div className="w-full max-w-[280px] flex-shrink-0 overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
    <div className="h-[220px] min-h-[220px] bg-slate-200 skeleton-shimmer" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded-full bg-slate-200 skeleton-shimmer" />
      <div className="h-4 w-1/2 rounded-full bg-slate-200 skeleton-shimmer" />
      <div className="h-10 rounded-xl bg-slate-200 skeleton-shimmer" />
    </div>
  </div>
);

export default SkeletonCard;
