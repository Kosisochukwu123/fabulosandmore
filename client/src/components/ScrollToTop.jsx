import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, state } = useLocation();
  const prevPath = useRef(null);

  useEffect(() => {
    // If navigating to a new page (not same page), scroll to top
    if (prevPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    prevPath.current = pathname;
  }, [pathname]);

  return null;
}