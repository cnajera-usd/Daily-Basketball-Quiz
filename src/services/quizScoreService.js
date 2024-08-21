// src/services/quizScoreService.js
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Function to save the quiz score to Firestore
export const saveQuizScore = async (userId, score, totalScore, quizDate) => {
    try {
        const quizCollection = collection(db, 'quizScores');
        await addDoc(quizCollection, {
            userId,
            score,
            totalScore,
            quizDate,
            timestamp: new Date()
        });
        console.log('Quiz score saved successfully!');
    } catch (error) {
        console.error('Error saving quiz score:', error);
    }
};

