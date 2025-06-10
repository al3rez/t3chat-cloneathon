import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChatApp } from './components/ChatApp';
import { SettingsPage } from './components/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatApp />} />
      <Route path="/settings/*" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;