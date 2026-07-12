import { useState, useCallback, useEffect } from 'react';
import TabBar from './components/tabs/TabBar';
import RecipeTab from './components/recipes/RecipeTab';
import SpellbookTab from './components/spellbooks/SpellbookTab';
import LocationsTab from './components/locations/LocationsTab';
import SkillsTab from './components/skills/SkillsTab';
import RaidBossTab from './components/raidboss/RaidBossTab';
import { TAB_NAMES } from './utils/constants';

type ActiveTab = 'recipes' | 'spellbooks' | 'locations' | 'skills' | 'raidboss';

const VALID_TABS: ReadonlySet<string> = new Set(['recipes', 'spellbooks', 'locations', 'skills', 'raidboss']);

function getTabFromHash(): ActiveTab {
  const hash = window.location.hash.replace('#', '');
  if (VALID_TABS.has(hash)) return hash as ActiveTab;
  return 'recipes';
}

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(getTabFromHash);

  const handleTabChange = useCallback((key: string) => {
    window.location.hash = key;
    if (key !== 'spellbooks') {
      const url = new URL(window.location.href);
      url.searchParams.delete('sbRace');
      url.searchParams.delete('sbQ');
      window.history.replaceState({}, '', url.toString());
    }
    setActiveTab(key as ActiveTab);
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="container">
      <h1>
        <a href="https://t.me/L2teamAGR" target="_blank" rel="noopener">
          ⚔️ L2team's start DashBoard
        </a>
        <span className="agr-badge">AGR</span>
      </h1>

      <div className="social-links">
        <a
          href="https://www.youtube.com/@ActualStormAGR"
          target="_blank"
          rel="noopener"
          className="social-link social-youtube"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a2.997 2.997 0 0 0-2.112-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.521a2.997 2.997 0 0 0-2.112 2.12A31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.997 2.997 0 0 0 2.112 2.12c1.881.521 9.386.521 9.386.521s7.505 0 9.386-.521a2.997 2.997 0 0 0 2.112-2.12A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12z" />
          </svg>
          YouTube
        </a>
        <a
          href="https://t.me/L2teamAGR"
          target="_blank"
          rel="noopener"
          className="social-link social-telegram"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.06-2.66 2.57c-.3.3-.55.55-1.1.55l.4-5.56 10.11-9.13c.44-.39-.1-.61-.68-.22L7.72 13.62l-5.5-1.72c-1.2-.38-1.21-1.2.25-1.77l21.5-8.28c1-.38 1.87.24 1.54 1.94z" />
          </svg>
          Telegram
        </a>
        <a
          href="https://mw5.community/topic/218849-l2teamagr-pereezzhaet-na-lu4-%E2%80%94-nabor-kp-mini-grupp-i-soloigrokov/"
          target="_blank"
          rel="noopener"
          className="social-link social-forum"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          </svg>
          Форум
        </a>
      </div>

      <TabBar tabs={TAB_NAMES} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'recipes' && (
        <div id="tab-recipes">
          <RecipeTab />
        </div>
      )}
      {activeTab === 'spellbooks' && (
        <div id="tab-spellbooks">
          <SpellbookTab />
        </div>
      )}
      {activeTab === 'locations' && (
        <div id="tab-locations">
          <LocationsTab />
        </div>
      )}
      {activeTab === 'skills' && (
        <div id="tab-skills">
          <SkillsTab onNavigateToTab={handleTabChange} />
        </div>
      )}
      {activeTab === 'raidboss' && (
        <div id="tab-raidboss">
          <RaidBossTab />
        </div>
      )}
    </div>
  );
}

export default App;
