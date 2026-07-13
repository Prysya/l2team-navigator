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

const BASE = import.meta.env.BASE_URL;

function getTabFromHash(): ActiveTab {
  const hash = window.location.hash.replace('#', '').split('?')[0];
  if (VALID_TABS.has(hash)) return hash as ActiveTab;
  return 'recipes';
}

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(getTabFromHash);
  const [fullHash, setFullHash] = useState(window.location.hash);

  useEffect(() => {
    const id = '__inter-fonts';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
@font-face { font-family:'Inter'; font-style:normal; font-weight:400; font-display:swap; src:url(${BASE}fonts/Inter-400.ttf) format('truetype'); }
@font-face { font-family:'Inter'; font-style:normal; font-weight:500; font-display:swap; src:url(${BASE}fonts/Inter-500.ttf) format('truetype'); }
@font-face { font-family:'Inter'; font-style:normal; font-weight:600; font-display:swap; src:url(${BASE}fonts/Inter-600.ttf) format('truetype'); }
@font-face { font-family:'Inter'; font-style:normal; font-weight:700; font-display:swap; src:url(${BASE}fonts/Inter-700.ttf) format('truetype'); }
`;
    document.head.appendChild(style);
  }, []);

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
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
      setFullHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="container">
      <header className="app-header">
        <div className="header-title">
          <h1>
            <a href="https://t.me/L2teamAGR" target="_blank" rel="noopener">
              <img
                className="header-logo"
                src={`${import.meta.env.BASE_URL}images/logo-l2team.png`}
                alt="L2team"
              />
            </a>
          </h1>
        </div>

        <div className="header-links">
          <a
            href="https://www.youtube.com/@ActualStormAGR"
            target="_blank"
            rel="noopener"
            className="social-link social-youtube"
            title="YouTube"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a2.997 2.997 0 0 0-2.112-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.521a2.997 2.997 0 0 0-2.112 2.12A31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.997 2.997 0 0 0 2.112 2.12c1.881.521 9.386.521 9.386.521s7.505 0 9.386-.521a2.997 2.997 0 0 0 2.112-2.12A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12z" />
            </svg>
          </a>
          <a
            href="https://t.me/L2teamAGR"
            target="_blank"
            rel="noopener"
            className="social-link social-telegram"
            title="Telegram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.06-2.66 2.57c-.3.3-.55.55-1.1.55l.4-5.56 10.11-9.13c.44-.39-.1-.61-.68-.22L7.72 13.62l-5.5-1.72c-1.2-.38-1.21-1.2.25-1.77l21.5-8.28c1-.38 1.87.24 1.54 1.94z" />
            </svg>
          </a>
          <a
            href="https://mw5.community/topic/218849-l2teamagr-pereezzhaet-na-lu4-%E2%80%94-nabor-kp-mini-grupp-i-soloigrokov/"
            target="_blank"
            rel="noopener"
            className="social-link social-forum"
            title="Forum"
          >
            <img
              className="forum-icon"
              src={`${import.meta.env.BASE_URL}mw2-favicon.ico`}
              alt="Forum"
            />
          </a>
        </div>
      </header>

      <TabBar tabs={TAB_NAMES} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'recipes' && (
        <div id="tab-recipes" key={fullHash}>
          <RecipeTab />
        </div>
      )}
      {activeTab === 'spellbooks' && (
        <div id="tab-spellbooks" key={fullHash}>
          <SpellbookTab />
        </div>
      )}
      {activeTab === 'locations' && (
        <div id="tab-locations" key={fullHash}>
          <LocationsTab />
        </div>
      )}
      {activeTab === 'skills' && (
        <div id="tab-skills" key={fullHash}>
          <SkillsTab onNavigateToTab={handleTabChange} />
        </div>
      )}
      {activeTab === 'raidboss' && (
        <div id="tab-raidboss" key={fullHash}>
          <RaidBossTab />
        </div>
      )}
    </div>
  );
}

export default App;
