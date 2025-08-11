import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { Authentication } from './components/Authentication';
import { Home } from './components/Home';
import { ClanApplication } from './components/ClanApplication';
import { Tickets } from './components/Tickets';
import { Raffles } from './components/Raffles';
import { Rules } from './components/Rules';
import { AdminPanel } from './components/AdminPanel';
import { Profile } from './components/Profile';
import { Footer } from './components/Footer';
import { Routes, Route } from 'react-router-dom';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/application" element={<ClanApplication />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/raffles" element={<Raffles />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;