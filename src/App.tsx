import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import TabBar from './components/tabs/TabBar';
import RecipeTab from './components/recipes/RecipeTab';
import SpellbookTab from './components/spellbooks/SpellbookTab';
import LocationsTab from './components/locations/LocationsTab';
import SkillsTab from './components/skills/SkillsTab';
import RaidBossTab from './components/raidboss/RaidBossTab';
import CalculatorTab from './components/calculator/CalculatorTab';
import QuestsTab from './components/quests/QuestsTab';
import { TAB_NAMES } from './utils/constants';

const BASE = import.meta.env.BASE_URL;
const BASE_CLEAN = BASE.replace(/\/$/, '');

const VALID_TABS: ReadonlySet<string> = new Set(['recipes', 'spellbooks', 'locations', 'skills', 'raidboss', 'calculator', 'quests']);

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeTab = useMemo(() => {
    const tab = location.pathname.split('/')[1] || '';
    return VALID_TABS.has(tab) ? tab : 'recipes';
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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

  const handleTabChange = (key: string) => {
    if (key.startsWith('spellbooks?')) {
      navigate('/' + key);
    } else {
      const params = new URLSearchParams(searchParams);
      if (key !== 'spellbooks') {
        params.delete('sbRace');
        params.delete('sbQ');
      }
      const qs = params.toString();
      navigate('/' + key + (qs ? `?${qs}` : ''));
    }
    setMenuOpen(false);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="header-title">
          <h1>
            <a href={BASE} onClick={e => { e.preventDefault(); navigate('/'); }}>
              <img className="header-logo" src={`${BASE}images/logo-l2team.png`} alt="L2team" />
            </a>
          </h1>
        </div>

        <div className="header-links">
          <button className="burger-btn" onClick={() => setMenuOpen(p => !p)} aria-label="Меню">
            <span className={`burger-line${menuOpen ? ' open' : ''}`} />
          </button>
          <a href="https://www.youtube.com/@ActualStormAGR" target="_blank" rel="noopener" className="social-link social-youtube" title="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.997 2.997 0 0 0-2.112-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.521a2.997 2.997 0 0 0-2.112 2.12A31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.997 2.997 0 0 0 2.112 2.12c1.881.521 9.386.521 9.386.521s7.505 0 9.386-.521a2.997 2.997 0 0 0 2.112-2.12A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12z" /></svg>
          </a>
          <a href="https://t.me/L2teamAGR" target="_blank" rel="noopener" className="social-link social-telegram" title="Telegram">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.06-2.66 2.57c-.3.3-.55.55-1.1.55l.4-5.56 10.11-9.13c.44-.39-.1-.61-.68-.22L7.72 13.62l-5.5-1.72c-1.2-.38-1.21-1.2.25-1.77l21.5-8.28c1-.38 1.87.24 1.54 1.94z" /></svg>
          </a>
          <a href="https://mw5.community/topic/218849-l2teamagr-pereezzhaet-na-lu4-%E2%80%94-nabor-kp-mini-grupp-i-soloigrokov/" target="_blank" rel="noopener" className="social-link social-forum" title="Forum">
            <img className="forum-icon" src={`${BASE}mw2-favicon.ico`} alt="Forum" />
          </a>
        </div>
      </header>

      <div className="tab-bar-desktop">
        <TabBar tabs={TAB_NAMES} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {menuOpen && (
        <div className="burger-overlay" onClick={() => setMenuOpen(false)}>
          <div className="burger-menu" onClick={e => e.stopPropagation()}>
            <div className="burger-header">
              <span className="burger-title">Меню</span>
              <button className="burger-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="burger-body">
              {TAB_NAMES.map(tab => (
                <button key={tab.key} className={`burger-item${activeTab === tab.key ? ' active' : ''}`} onClick={() => handleTabChange(tab.key)}>
                  <span className="burger-item-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="burger-divider" />
            <div className="burger-socials">
              <a href="https://www.youtube.com/@ActualStormAGR" target="_blank" rel="noopener" className="burger-social-link social-youtube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.498 6.186a2.997 2.997 0 0 0-2.112-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.521a2.997 2.997 0 0 0-2.112 2.12A31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.997 2.997 0 0 0 2.112 2.12c1.881.521 9.386.521 9.386.521s7.505 0 9.386-.521a2.997 2.997 0 0 0 2.112-2.12A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12z" /></svg>
                YouTube
              </a>
              <a href="https://t.me/L2teamAGR" target="_blank" rel="noopener" className="burger-social-link social-telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.06-2.66 2.57c-.3.3-.55.55-1.1.55l.4-5.56 10.11-9.13c.44-.39-.1-.61-.68-.22L7.72 13.62l-5.5-1.72c-1.2-.38-1.21-1.2.25-1.77l21.5-8.28c1-.38 1.87.24 1.54 1.94z" /></svg>
                Telegram
              </a>
              <a href="https://mw5.community/topic/218849-l2teamagr-pereezzhaet-na-lu4-%E2%80%94-nabor-kp-mini-grupp-i-soloigrokov/" target="_blank" rel="noopener" className="burger-social-link social-forum">
                <img src={`${BASE}mw2-favicon.ico`} alt="Forum" width="20" height="20" style={{ flexShrink: 0 }} />
                Forum
              </a>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="recipes" replace />} />
        <Route path="/recipes" element={<RecipeTab />} />
        <Route path="/spellbooks" element={<SpellbookTab />} />
        <Route path="/locations" element={<LocationsTab />} />
        <Route path="/skills" element={<SkillsTab onNavigateToTab={handleTabChange} />} />
        <Route path="/raidboss" element={<RaidBossTab />} />
        <Route path="/calculator" element={<CalculatorTab />} />
        <Route path="/quests" element={<QuestsTab />} />
      </Routes>

      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">
            Неофициальная wiki база знаний игры lu4, с дропом, боссами и калькулятором, созданная для игроков клана{' '}
            <a href="https://t.me/L2teamAGR" target="_blank" rel="noopener" className="footer-link">L2team</a>.
          </p>
          <p className="footer-text">
            Сайт является некоммерческим и неофициальным фанатским ресурсом,
            не связан с авторами игры и создан исключительно в ознакомительных целях.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={BASE_CLEAN}>
      <AppLayout />
    </BrowserRouter>
  );
}
