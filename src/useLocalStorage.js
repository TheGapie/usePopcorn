import { useState, useEffect } from "react";

export function useLocalStorage(initialValue, key) {
  const [value, setValue] = useState(function () {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : initialValue;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
