import React, { useState } from 'react';
import { auth } from '../../firebaseConfig'; // Import Firebase auth
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = () => {
  // State to toggle between login and registration forms
  const [isRegistering, setIsRegistering] = useState(true);

  // Form fields
  const [email, setEmail] = useState(''); // State for storing email input
  const [password, setPassword] = useState(''); // State for storing password input

  // Error handling
  const [error, setError] = useState(''); // State for storing error messages

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Registration successful! You can now log in.');
      setEmail(''); // Clear email input field
      setPassword(''); // Clear password input field
      setError(''); // Clear error message
      setIsRegistering(false); // Switch to login form after registration
    } catch (error) {
      setError(error.message); // Set error message if registration fails
    }
  };

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
      setEmail(''); // Clear email input field
      setPassword(''); // Clear password input field
      setError(''); // Clear error message
    } catch (error) {
      setError(error.message); // Set error message if login fails
    }
  };

  // Render form based on the current state
  return (
    <div className="container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
            required
          />
        </div>
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error messages */}
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default Auth;
