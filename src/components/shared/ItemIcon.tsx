import { itemIconUrl, itemIconUrlById } from '@utils/itemWiki';

import styles from './ItemIcon.module.scss';

interface ItemIconProps {
  /** Look up the icon by item name (boss drops). */
  name?: string;
  /** Look up the icon by wiki item id (spellbooks, resources). Takes precedence. */
  id?: number;
  size?: number;
}

/**
 * Small, non-clickable item icon hotlinked from the official wiki.
 * Renders an empty same-size slot when the icon is unknown so rows stay aligned.
 */
export default function ItemIcon({ name, id, size = 22 }: ItemIconProps) {
  const url = id != null ? itemIconUrlById(id) : name ? itemIconUrl(name) : null;
  const style = { width: size, height: size };

  if (!url) return <span className={styles.slot} style={style} aria-hidden="true" />;

  return (
    <img
      className={styles.icon}
      style={style}
      src={url}
      alt=""
      title={name}
      loading="lazy"
      draggable={false}
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden';
      }}
    />
  );
}
