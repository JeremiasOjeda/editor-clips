import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';

// Página temporal para rutas no implementadas
const TempPage = ({ title }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Esta página se implementará en los próximos sprints</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video/:code" element={<TempPage title="Página de Video" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;