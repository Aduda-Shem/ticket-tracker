import { useEffect, useState } from "react";

// Minimal pub/sub toast so actions (outside React) can notify the UI.
const listeners = new Set();
let nextId = 0;

export const openNotification = (type, text) =>
  listeners.forEach((listener) => listener({ id: ++nextId, type, text }));

export const useToasts = (timeout = 3500) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts((current) => [...current, toast]);
      setTimeout(() => setToasts((current) => current.filter((t) => t !== toast)), timeout);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [timeout]);

  return toasts;
};
