// src/services/authService.js
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const signUp = async (email, password) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw error;
    }
};

// Function to handle user logic with additional check for existing authentication
export const login = async (email, password) => {
    try {
        // check if user is already signed in
        if (auth.currentUser) {
            console.log("Already signed in");
            return;
        }
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = () => {
    return auth.currentUser;
};
