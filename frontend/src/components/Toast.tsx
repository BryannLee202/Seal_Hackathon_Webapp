import { useEffect, useState } from "react";
import { getToastEntries, subscribeToast, type ToastEntry } from "../lib/toast";

export function ToastContainer() {
  const [items, setItems] = useState<ToastEntry[]>(getToastEntries());

  useEffect(() => subscribeToast(setItems), []);

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
