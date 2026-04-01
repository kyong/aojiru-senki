import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { NavigationGuardProvider } from './context/NavigationGuardContext';
import Home from './pages/Home';
import Battle from './pages/Battle';
import QuestSelect from './pages/QuestSelect';
import Gacha from './pages/Gacha';
import GachaList from './pages/GachaList';
import CharacterDetail from './pages/CharacterDetail';
import Party from './pages/Party';
import PresentPage from './pages/Present';
import Menu from './pages/Menu';
import Shop from './pages/Shop';
import Splash from './pages/Splash';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ServiceEnd from './pages/ServiceEnd';

/** location.state.retryKey が変わるたびに Battle を再マウントさせるラッパー */
function BattleWrapper() {
  const location = useLocation();
  const key = (location.state as { retryKey?: number } | null)?.retryKey ?? 0;
  return <Battle key={key} />;
}

function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isServiceRestored, setIsServiceRestored] = useState(
    localStorage.getItem('aojiru_service_restored') === 'true'
  );

  // サービス終了日時: 2026年4月2日
  const isServiceEnded = useMemo(() => {
    // デバッグ用にURLパラメータ ?debug_sashu=1 で強制表示可能にする
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug_sashu') === '1' && !isServiceRestored) return true;

    const now = new Date();
    const serviceEndDate = new Date('2026-04-02T00:00:00+09:00');
    return now >= serviceEndDate && !isServiceRestored;
  }, [isServiceRestored]);

  return (
    <GameProvider>
      <BrowserRouter>
        <NavigationGuardProvider>
          {!hasLoaded ? (
            <Splash onComplete={() => setHasLoaded(true)} />
          ) : isServiceEnded ? (
            <ServiceEnd onRestore={() => setIsServiceRestored(true)} />
          ) : (
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/quest"   element={<QuestSelect />} />
              <Route path="/battle"  element={<BattleWrapper />} />
              <Route path="/gacha"   element={<Gacha />} />
              <Route path="/gacha/list" element={<GachaList />} />
              <Route path="/character/:id" element={<CharacterDetail />} />
              <Route path="/party"   element={<Party />} />
              <Route path="/present" element={<PresentPage />} />
              <Route path="/shop"    element={<Shop />} />
              <Route path="/menu"    element={<Menu />} />
              <Route path="/terms"   element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          )}
        </NavigationGuardProvider>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
