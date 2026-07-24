import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { UserSummary } from "../api/types";

/**
 * Searchable dropdown over approved users - lets Coordinator pick a person by
 * name/email instead of pasting a raw UUID. Resolves to the underlying user id.
 */
export function PersonPicker({
  value,
  onChange,
  placeholder = "Tìm theo tên hoặc email...",
}: {
  value: string;
  onChange: (userId: string, user: UserSummary | null) => void;
  placeholder?: string;
}) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get<UserSummary[]>("/api/admin/users/approved").then((res) => setUsers(res.data));
  }, []);

  const selected = users.find((u) => u.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!query.trim()) return users.slice(0, 8);
    const q = query.toLowerCase();
    return users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 8);
  }, [users, query]);

  return (
    <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
      <input
        placeholder={placeholder}
        value={selected ? `${selected.fullName} (${selected.email})` : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (selected) onChange("", null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 20,
            marginTop: 4,
            padding: 6,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {filtered.map((u) => (
            <div
              key={u.id}
              onMouseDown={() => {
                onChange(u.id, u);
                setQuery("");
                setOpen(false);
              }}
              style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ fontWeight: 600 }}>{u.fullName}</div>
              <div className="muted">{u.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
