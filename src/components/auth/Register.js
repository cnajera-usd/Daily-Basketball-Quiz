import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig'; // Import Firebase auth and Firestore db
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const Register = () => {
  const [email, setEmail] = useState(''); // State for storing email input
  const [password, setPassword] = useState(''); // State for storing password input
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(''); // State for storing username input
  const [error, setError] = useState(''); // State for storing error messages
  const [showPassword, setShowPassword] = useState(false);

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

      // Save additional user data to Firestore automatically using the UID as the document ID
      await setDoc(doc(db, 'users', user.uid), {
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
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
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
            type={showPassword ? "text" : "password"} // Toggle between password and text input type
            value={password}
            onChange={(e) => setPassword(e.target.value)} // update password state on change
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // toggle passsword state on change
          >
            {showPassword ? "Hide" : "Show"} Password
          </button>
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
