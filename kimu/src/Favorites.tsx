import KeyCard from "./Components/KeyCard";
import type { KeyMeta } from "./lib/api";

interface FavoritesProps {
  keys: KeyMeta[];
  onRefresh: () => void;
}

export default function Favorites({ keys, onRefresh }: FavoritesProps) {
  const favorites = keys.filter((k) => k.is_favorite);

  if (favorites.length === 0) {
    return (
      <div className="empty-state">
        No favorites yet. Star a secret to see it here.
      </div>
    );
  }

  return (
    <div className="key-grid">
      {favorites.map((secret) => (
        <KeyCard
          key={secret.name}
          name={secret.name}
          tag={secret.tag}
          memo={secret.memo}
          isFavorite={secret.is_favorite}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
