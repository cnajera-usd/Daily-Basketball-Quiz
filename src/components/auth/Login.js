/*


import React, { useState } from 'react';
import { auth } from '../../firebaseConfig'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState(''); // State for storing email input
  const [password, setPassword] = useState(''); // State for storing password input
  const [error, setError] = useState(''); // State for storing error messages

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
    } catch (error) {
      setError(error.message); // Set error message if login fails
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;

*/