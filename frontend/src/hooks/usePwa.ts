
import { useState, useEffect } from 'react';

export function useIsPwa() {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const checkPwa = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsPwa(isStandalone);
    };

    checkPwa();
    
    const matcher = window.matchMedia('(display-mode: standalone)');
    matcher.addEventListener('change', checkPwa); // Listen for changes

    return () => matcher.removeEventListener('change', checkPwa);
  }, []);

  return isPwa;
}
