import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { NavigationGuardProvider } from './context/NavigationGuardContext';
import Home from './pages/Home';
import Battle from './pages/Battle';
import QuestSelect from './pages/QuestSelect';
import Gacha from './pages/Gacha';
import Party from './pages/Party';
import PresentPage from './pages/Present';
import Menu from './pages/Menu';
import Shop from './pages/Shop';
import Splash from './pages/Splash';

function App() {
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <GameProvider>
      <BrowserRouter>
        <NavigationGuardProvider>
          {!hasLoaded ? (
            <Splash onComplete={() => setHasLoaded(true)} />
          ) : (
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/quest"   element={<QuestSelect />} />
              <Route path="/battle"  element={<Battle />} />
              <Route path="/gacha"   element={<Gacha />} />
              <Route path="/party"   element={<Party />} />
              <Route path="/present" element={<PresentPage />} />
              <Route path="/shop"    element={<Shop />} />
              <Route path="/menu"    element={<Menu />} />
            </Routes>
          )}
        </NavigationGuardProvider>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
