import { useState, useEffect } from 'react';

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  loading: boolean;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): UseLocalStorageReturn<T> {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return { value, setValue: setStoredValue, loading };
}
