import { useState } from 'react';

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch { return initial; }
  });

  const set = (val) => {
    try {
      const v = typeof val === 'function' ? val(value) : val;
      setValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };

  return [value, set];
}