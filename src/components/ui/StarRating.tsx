import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
        />
      ))}
      <span className="ml-1 text-sm text-slate-500">{rating.toFixed(1)}</span>
    </div>
  );
}
