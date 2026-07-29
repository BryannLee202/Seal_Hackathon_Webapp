export type ToastKind = "success" | "error";
export interface ToastEntry {
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

export function getToastEntries() {
  return entries;
}

export function subscribeToast(listener: (entries: ToastEntry[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
