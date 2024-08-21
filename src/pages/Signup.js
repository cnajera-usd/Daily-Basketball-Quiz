// src/pages/SignUp.js
import React, { useState } from 'react';
import { signUp } from '../services/authService';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await signUp(email, password);
            alert("User signed up successfully!");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <h1>Sign Up</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p>{error}</p>}
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;
