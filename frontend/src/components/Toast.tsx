import { useEffect, useState } from "react";

type ToastKind = "success" | "error";
interface ToastEntry {
  id: number;
  kind: ToastKind;
  message: string;
}

let nextId = 1;
let entries: ToastEntry[] = [];
const listeners = new Set<(entries: ToastEntry[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(entries));
}

function push(kind: ToastKind, message: string) {
  const entry = { id: nextId++, kind, message };
  entries = [...entries, entry];
  emit();
  setTimeout(() => {
    entries = entries.filter((e) => e.id !== entry.id);
    emit();
  }, 4000);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
};

export function ToastContainer() {
  const [items, setItems] = useState<ToastEntry[]>(entries);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="toast-stack">
      {items.map((item) => (
        <div className={`toast ${item.kind}`} key={item.id}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
