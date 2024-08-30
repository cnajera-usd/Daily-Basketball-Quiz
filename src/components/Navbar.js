import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import '../styles/Navbar.css';

const Navbar = ({ user }) => {
  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log("user signed out");
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/quiz">Quiz</Link>
        </li>
        <li>
          <Link to="/leaderboard">Leaderboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        {user ? (
          <>
          <span>Welcome, {user.displayName || user.email}</span>
          <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
        <li>
          <Link to="/auth">Register/Login</Link>
        </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
