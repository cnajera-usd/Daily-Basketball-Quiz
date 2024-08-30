import React, { useState } from 'react';
import { auth } from '../../firebaseConfig'; // Import Firebase auth and Firestore db
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { createUserProfile } from '../../services/userService';

const Register = () => {
  const [email, setEmail] = useState(''); // State for storing email input
  const [password, setPassword] = useState(''); // State for storing password input
  const [confirmPassword, setConfirmPassword] = useState(''); // State for storing confirm password input
  const [username, setUsername] = useState(''); // State for storing username input
  const [error, setError] = useState(''); // State for storing error messages
  const [showPassword, setShowPassword] = useState(false); // State for managing password visibility

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the username
      await updateProfile(user, { displayName: username });

      // call the createUserProfile function to save the user profile
      await createUserProfile({
        uid: user.uid,
        username: username,
        email: email
      });


      alert('Registration successful! You can now log in.');
    } catch (error) {
      setError(error.message); // Set error message if registration fails
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state on change
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? "text" : "password"} // Toggle between password and text input type
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // update password state on change
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // toggle password visibility
              style={{ marginLeft: '10px' }} // Add some space between input and button
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type={showPassword ? "text" : "password"} // toggle between password and text input type
            id="confirm-password"
            name="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state on change
            required
          />
        </div>
        <button className="btn-primary" type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error messages */}
    </div>
  );
};

export default Register;
