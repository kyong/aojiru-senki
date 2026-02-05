import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Placeholder routes for now */}
        <Route path="/quest" element={<Home />} />
        <Route path="/gacha" element={<Home />} />
        <Route path="/party" element={<Home />} />
        <Route path="/present" element={<Home />} />
        <Route path="/menu" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
