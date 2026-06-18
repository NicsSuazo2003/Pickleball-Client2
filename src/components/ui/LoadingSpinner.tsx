import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={32} className="animate-spin text-teal-600" />
    </div>
  );
}
