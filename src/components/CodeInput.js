import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CodeInput() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/video/${code}`);
    }
  };

  return (
    <div className="code-input-container">
      <h2>Ingrese el código del video</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ingrese el código"
        />
        <button type="submit">Continuar</button>
      </form>
    </div>
  );
}

export default CodeInput;