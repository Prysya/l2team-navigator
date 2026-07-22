import styles from './WikiLink.module.scss';

interface WikiLinkProps {
  href: string;
  title?: string;
}

/** External-link icon that opens the official wiki page in a new tab. */
export default function WikiLink({ href, title = 'Открыть на вики' }: WikiLinkProps) {
  return (
    <a
      className={styles.wikiBtn}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <svg
        className={styles.wikiIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
