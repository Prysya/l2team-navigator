const BASE = import.meta.env.BASE_URL;

// Lineage2-style section icons live in public/images/sections/<tab>.min.svg
// (SVGO-optimized duplicates of the pristine <tab>.svg originals kept alongside).
// They are black silhouettes on transparent, so we render each as a CSS mask and
// paint it with `currentColor` — the icon then inherits the surrounding text color
// (active-tab accent, muted when inactive, or an explicit color set by the parent).
// Kept as external static assets (not inlined) so the SVGs stay out of the JS bundle.
interface SectionIconProps {
  tab: string;
  /** Square size in px. Omit to let CSS (width/height) control the size. */
  size?: number;
  className?: string;
}

export default function SectionIcon({ tab, size, className }: SectionIconProps) {
  const mask = `url(${BASE}images/sections/${tab}.min.svg)`;
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        ...(size ? { width: size, height: size } : null),
        backgroundColor: 'currentColor',
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}
