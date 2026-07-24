import { MascotBot } from "./MascotBot";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="empty-state-rich">
      <MascotBot size={52} />
      <div className="title">{title}</div>
      {description && <div className="desc">{description}</div>}
    </div>
  );
}
