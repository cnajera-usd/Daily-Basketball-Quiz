// src/services/quizScoreService.js
import { db } from '../firebaseConfig'; // Import Firebase Firestore configuration
import { collection, addDoc, getDoc, setDoc, doc } from 'firebase/firestore'; // Import Firestore functions

// Function to save the quiz score to Firestore
export const saveQuizScore = async (userId, username, score, totalScore, quizDate) => {
    try {
        const quizCollection = collection(db, 'quizScores'); // Reference to the 'quizScores' collection
        await addDoc(quizCollection, {
            userId, // User's ID
            username,
            score, // Score achieved in the quiz
            totalScore, // Total possible score in the quiz
            quizDate, // Date of the quiz
            timestamp: new Date(), // Timestamp of when the score was saved
        });
        console.log('Quiz score saved successfully!');

        // Track the quiz attempt by saving it to the quizAttempts collection
        const attemptRef = doc(db, 'quizAttempts', `${userId}_${quizDate}`);
        await setDoc(attemptRef, {
            userId,
            quizDate,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error saving quiz score:', error);
    }
};

