// src/services/quizScoreService.js
import { db } from '../firebaseConfig'; // Import Firebase Firestore configuration
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import moment from 'moment-timezone';

// Function to save the quiz score to Firestore
export const saveQuizScore = async (userId, username, score, quizDate) => {
    try {
        const quizCollection = collection(db, 'quizScores');
        await addDoc(quizCollection, {
            userId,
            username,
            score,
            quizDate,
            timestamp: new Date(),
        });


        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const currentDate = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');

        let newStreak = 1;
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const lastQuizDate = userData.lastQuizDate || '';
            const streak = userData.streak || 0;

            const yesterday = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
            if (lastQuizDate === yesterday) {
                newStreak = streak + 1;
            }
        }

        await setDoc(userRef, {
            streak: newStreak,
            lastQuizDate: currentDate,
            username: username,            
        }, { merge: true });
    } catch (error) {
        console.error('Error saving quiz store or updating streak:', error);
    }
};
