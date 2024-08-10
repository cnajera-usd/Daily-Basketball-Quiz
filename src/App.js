import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import Auth from './components/auth/Auth';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* Use the Navbar component here */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Quiz" element={<QuizPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
