import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import Auth from './components/auth/Auth';
import './styles/theme.css';
import { auth } from "./firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import Register from './components/auth/Register';

function App() {

  const [user, setUser] = useState(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in:", user);
      setUser(user); // Update state with user info
    } else {
      console.log("No user is signed in");
      setUser(null); // Set state to null when no user is signed in
    }
  });

  return () => unsubscribe();
}, []);

  
  
  return (
    <Router>
      <div>
        <Navbar user={user} /> {/* Use the Navbar component here */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
