import React from 'react';
import CodeInput from '../components/CodeInput';

function HomePage() {
  return (
    <div className="home-page">
      <header>
        <h1>Editor de Clips de Video</h1>
      </header>
      <main>
        <CodeInput />
      </main>
    </div>
  );
}

export default HomePage;