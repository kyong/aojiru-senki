import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Battle from './pages/Battle';
import QuestSelect from './pages/QuestSelect';
import Gacha from './pages/Gacha';
import Party from './pages/Party';
import PresentPage from './pages/Present';
import Menu from './pages/Menu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/quest"   element={<QuestSelect />} />
        <Route path="/battle"  element={<Battle />} />
        <Route path="/gacha"   element={<Gacha />} />
        <Route path="/party"   element={<Party />} />
        <Route path="/present" element={<PresentPage />} />
        <Route path="/menu"    element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
