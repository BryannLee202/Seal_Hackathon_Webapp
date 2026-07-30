import { SealEmblem } from "./SealEmblem";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="empty-state-rich">
      <SealEmblem size={52} />
      <div className="title">{title}</div>
      {description && <div className="desc">{description}</div>}
    </div>
  );
}
