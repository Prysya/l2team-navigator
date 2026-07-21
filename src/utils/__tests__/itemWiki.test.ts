import { describe, expect, it } from 'vitest';

import { itemIconUrl, itemWikiUrl } from '../itemWiki';

describe('itemWikiUrl', () => {
  it('returns a direct item page for a known drop item', () => {
    // "Proof of Loyalty" is a stable, widely-dropped item (id 9910).
    expect(itemWikiUrl('Proof of Loyalty')).toBe('https://masterwork.wiki/lu4/item/9910-proof-of-loyalty');
  });

  it('is case-insensitive', () => {
    expect(itemWikiUrl('proof of loyalty')).toBe('https://masterwork.wiki/lu4/item/9910-proof-of-loyalty');
  });

  it('falls back to item search for an unknown item', () => {
    expect(itemWikiUrl('Totally Unknown Item 123')).toBe(
      'https://masterwork.wiki/lu4/search/result?Search%5Bquery%5D=Totally%20Unknown%20Item%20123&Search%5Bsearch_type%5D=0',
    );
  });
});

describe('itemIconUrl', () => {
  it('returns a hotlinked wiki icon for a known item', () => {
    expect(itemIconUrl('Proof of Loyalty')).toBe('https://masterwork.wiki/i64/etc_broken_crystal_red_i00.png');
  });

  it('returns null for an unknown item', () => {
    expect(itemIconUrl('Totally Unknown Item 123')).toBeNull();
  });
});
