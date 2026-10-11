import { useEffect, useState } from "react";

// Minimal pub/sub toast so actions (outside React) can notify the UI.
let listeners = [];
let nextId = 0;

export const openNotification = (type, text) => {
  const toast = { id: ++nextId, type, text };
  listeners.forEach((listener) => listener(toast));
};

export const useToasts = (timeout = 3500) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts((current) => [...current, toast]);
      setTimeout(
        () => setToasts((current) => current.filter((t) => t.id !== toast.id)),
        timeout
      );
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, [timeout]);

  return toasts;
};
