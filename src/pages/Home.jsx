import React from 'react';
import { Link } from 'react-router-dom';
import logoBanagro from '../assets/logo_banagro.png';
import { Leaf, Map, BarChart3, Settings } from 'lucide-react'; // Iconos elegantes

const Home = () => {
  return (
    <div className="home-screen">
      {/* SECCIÓN DEL LOGO GRANDE */}
      <header className="home-header">
        <img src={logoBanagro} alt="Banagro Logo" className="main-logo-hero" />
        <h1 className="brand-title">BANAGRO</h1>
        <p className="brand-tagline">Sistema de Gestión labores</p>
      </header>

      {/* BOTONES GRANDES (DASHBOARD) */}
      <nav className="dashboard-menu">
        <Link to="/captura" className="menu-card">
          <div className="card-icon agri"><Leaf size={40} /></div>
          <div className="card-info">
            <h3>Agricultura</h3>
            <p>Captura de datos (8m)</p>
          </div>
        </Link>

        <Link to="/mapas" className="menu-card">
          <div className="card-icon maps"><Map size={40} /></div>
          <div className="card-info">
            <h3>Mapas</h3>
            <p>Georeferenciación</p>
          </div>
        </Link>

        <Link to="/reportes" className="menu-card">
          <div className="card-icon reports"><BarChart3 size={40} /></div>
          <div className="card-info">
            <h3>Reportes</h3>
            <p>Exportar a Excel</p>
          </div>
        </Link>

        <Link to="/admin" className="menu-card">
          <div className="card-icon admin"><Settings size={40} /></div>
          <div className="card-info">
            <h3>Admin</h3>
            <p>Configuración</p>
          </div>
        </Link>
      </nav>
    </div>
  );
};

export default Home;