import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Battle from './pages/Battle';
import QuestSelect from './pages/QuestSelect';
import Gacha from './pages/Gacha';
import Party from './pages/Party';
import PresentPage from './pages/Present';
import Menu from './pages/Menu';
import Splash from './pages/Splash';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/splash"  element={<Splash />} />
          <Route path="/"        element={<Home />} />
          <Route path="/quest"   element={<QuestSelect />} />
          <Route path="/battle"  element={<Battle />} />
          <Route path="/gacha"   element={<Gacha />} />
          <Route path="/party"   element={<Party />} />
          <Route path="/present" element={<PresentPage />} />
          <Route path="/menu"    element={<Menu />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
