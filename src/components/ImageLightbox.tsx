import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, title, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const total = images.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose]);

  if (total === 0) return null;
  const src = `${import.meta.env.BASE_URL}${images[index]}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} screenshots` : 'Screenshots'}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="absolute top-4 left-4 text-white/90 text-sm font-medium space-y-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-white/60">
          {index + 1} / {total}
        </div>
      </div>

      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Previous screenshot"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      <img
        src={src}
        alt={title ? `${title} ${index + 1} of ${total}` : `Screenshot ${index + 1} of ${total}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
      />

      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Next screenshot"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {total > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to screenshot ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
