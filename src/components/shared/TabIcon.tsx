import type { FC, SVGProps } from 'react';

const SIZE = 24;

const icons: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  recipes: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h5l2 3h9v3H4V4z" />
      <path d="M6 10v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7" />
      <circle cx="12" cy="15" r="2" />
      <path d="M10 4V2h4v2" />
    </svg>
  ),
  spellbooks: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      <line x1="8" y1="11" x2="12" y2="11" />
      <line x1="8" y1="15" x2="12" y2="15" />
    </svg>
  ),
  locations: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="3" />
      <path d="M1 22h22" />
    </svg>
  ),
  skills: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  raidboss: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="4" />
      <circle cx="15" cy="9" r="4" />
      <path d="M3 13l1.5 1.5L6 13" />
      <path d="M18 13l1.5 1.5L21 13" />
      <line x1="7" y1="9" x2="11" y2="9" />
      <line x1="13" y1="9" x2="17" y2="9" />
      <line x1="6" y1="15" x2="18" y2="15" />
      <path d="M9 15v2a3 3 0 0 0 6 0v-2" />
    </svg>
  ),
  calculator: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <polyline points="3 18 6 15 9 18" />
    </svg>
  ),
  quests: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <polyline points="9 12 11 14 15 10" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  ),
};

interface TabIconProps {
  tab: string;
  size?: number;
  className?: string;
}

export default function TabIcon({ tab, size = SIZE, className }: TabIconProps) {
  const Icon = icons[tab];
  if (!Icon) return null;
  return <Icon width={size} height={size} className={className} />;
}
