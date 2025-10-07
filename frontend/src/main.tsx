import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Issue from './pages/Issue';
import Verify from './pages/Verify';
import './styles.css';

function AppShell() {
  return (
    <BrowserRouter>
      <div className="container">
        <nav className="nav">
          <Link to="/">Issue</Link>
          <Link to="/verify">Verify</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Issue />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<AppShell />);