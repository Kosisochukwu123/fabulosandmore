import React, { useState, useEffect, useRef } from 'react';

export default function LazyImage({
  src,
  alt = '',
  className = '',
  style = {},
  placeholder = '/placeholder.svg',
  onLoad,
}) {
  const [loaded, setLoaded]   = useState(false);
  const [inView, setInView]   = useState(false);
  const [error, setError]     = useState(false);
  const imgRef                = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '200px' }   // start loading 200px before visible
    );
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`lazy-img-wrap ${className}`} style={style}>
      {/* Blurred placeholder shown while loading */}
      {!loaded && (
        <div className="lazy-img-placeholder">
          <img src={placeholder} alt="" className="lazy-img-blur" aria-hidden />
        </div>
      )}
      {/* Actual image — only fetched when near viewport */}
      {inView && (
        <img
          src={error ? placeholder : src}
          alt={alt}
          className={`lazy-img ${loaded ? 'lazy-img-visible' : 'lazy-img-hidden'}`}
          onLoad={() => { setLoaded(true); onLoad?.(); }}
          onError={() => { setError(true); setLoaded(true); }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}