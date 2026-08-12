import { beforeEach, describe, expect, it } from 'vitest';

import { useGuideStore } from '../guideStore';

beforeEach(() => {
  useGuideStore.setState({ expanded: new Set(), infoOpen: new Set() });
});

describe('guideStore', () => {
  it('toggles expanded Set', () => {
    useGuideStore.getState().toggleExpanded("Miner's Favor");
    expect(useGuideStore.getState().expanded.has("Miner's Favor")).toBe(true);

    useGuideStore.getState().toggleExpanded("Miner's Favor");
    expect(useGuideStore.getState().expanded.has("Miner's Favor")).toBe(false);
  });

  it('toggles infoOpen Set', () => {
    useGuideStore.getState().toggleInfo('Letters of Love');
    expect(useGuideStore.getState().infoOpen.has('Letters of Love')).toBe(true);

    useGuideStore.getState().toggleInfo('Letters of Love');
    expect(useGuideStore.getState().infoOpen.has('Letters of Love')).toBe(false);
  });

  it('keeps expanded and infoOpen independent', () => {
    useGuideStore.getState().toggleExpanded('Catch the Wind');
    useGuideStore.getState().toggleInfo('Catch the Wind');

    expect(useGuideStore.getState().expanded.has('Catch the Wind')).toBe(true);
    expect(useGuideStore.getState().infoOpen.has('Catch the Wind')).toBe(true);

    useGuideStore.getState().toggleExpanded('Catch the Wind');
    expect(useGuideStore.getState().expanded.has('Catch the Wind')).toBe(false);
    expect(useGuideStore.getState().infoOpen.has('Catch the Wind')).toBe(true);
  });
});
