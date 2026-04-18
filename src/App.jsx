import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importaciones de tus páginas
import Home from './pages/Home';
import FormularioAgricultura from './pages/FormularioAgricultura';
import Admin from './pages/Admin';
import Reportes from './pages/Reportes';
import Mapas from './pages/Mapas';

// Estilos
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Esta es la ruta que muestra el logo y los botones grandes al inicio */}
          <Route path="/" element={<Home />} />
          
          {/* Estas son las rutas internas */}
          <Route path="/captura" element={<FormularioAgricultura />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/mapas" element={<Mapas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;