import React, { useState } from 'react';
import { auth } from '../../firebaseConfig'; // Import Firebase auth
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Import updateProfile to update user profile
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../../firebaseConfig'; // Import Firestore database

const Register = () => {
  const [email, setEmail] = useState(''); // State for storing email input
  const [password, setPassword] = useState(''); // State for storing password input
  const [username, setUsername] = useState(''); // State for storing username input (New state)
  const [error, setError] = useState(''); // State for storing error messages

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the username (New code)
      await updateProfile(user, { displayName: username });

      // Save additional user data to Firestore (Optional, new code)
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email
      });

      alert('Registration successful! You can now log in.');
    } catch (error) {
      setError(error.message); // Set error message if registration fails
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label> {/* New field for username */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state on change
            required
          />
        </div>
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
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error messages */}
    </div>
  );
};

export default Register;
