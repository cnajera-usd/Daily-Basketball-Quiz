import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig'; // Import Firebase auth and Firestore db
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Import Firebase auth methods
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import '../../styles/Auth.css'; // Import CSS for styling

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(true); // State to toggle between Register and Login forms

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State for storing confirm password input
  const [username, setUsername] = useState(''); // State for storing username input
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for managing password visibility

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the username
      await updateProfile(user, { displayName: username });

      // Save additional user data to Firestore automatically using the UID as the document ID
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username,
        email: email
      });

      alert('Registration successful! You can now log in.');

      // Clear the form inputs
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setError('');
      setIsRegistering(false); // Switch to login form after successful registration
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="form-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && ( // Only show username input if registering
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginLeft: '10px' }}
            >
              {showPassword ? 'Hide' : 'Show'} Password
            </button>
          </div>
        </div>
        {isRegistering && ( // Only show confirm password if registering
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        <button className="btn-primary" type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button className="toggle-btn" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default Auth;
