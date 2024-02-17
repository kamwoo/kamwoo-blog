import { useCallback, useEffect, useState } from 'react';

export const useHash = () => {
  const [value, setValue] = useState<string>();

  const handleHashChangeComplete = useCallback(() => {
    const hash = location.hash.replace('#', '');
    setValue(hash);
  }, []);

  useEffect(() => {
    addEventListener('hashchange', handleHashChangeComplete);

    return () => {
      removeEventListener('hashchange', handleHashChangeComplete);
    };
  }, [handleHashChangeComplete]);

  return { value };
};
