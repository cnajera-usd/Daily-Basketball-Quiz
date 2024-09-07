import { db } from '../firebaseConfig'; // Import Firebase Firestore configuration
import { setDoc, doc, getDoc } from 'firebase/firestore'; // Only import necessary Firestore functions
import moment from 'moment-timezone';

export const saveQuizScore = async (userId, username, score, totalScore, quizDate) => {
    try {
        const streakDocRef = doc(db, 'userStreaks', userId);        
        const streakSnap = await getDoc(streakDocRef);

        let newStreak = 1;
        if (streakSnap.exists()) {
            const userData = streakSnap.data();
            const lastQuizDate = userData.lastQuizDate || '';
            const streak = userData.streak || 0;

            // Ensure consistent timezone handling for both dates
            const lastQuizDateInTZ = moment.tz(lastQuizDate, 'America/Los_Angeles'); // Example timezone
            const quizDateInTZ = moment.tz(quizDate, 'America/Los_Angeles');

            // Check if the last quiz date was yesterday to continue the streak
            if (lastQuizDateInTZ.isSame(quizDateInTZ.clone().subtract(1, 'days'), 'day')) {
                newStreak = streak + 1;
            } else if (!lastQuizDateInTZ.isSame(quizDateInTZ, 'day')) {
                // Reset streak if the quiz date is not consecutive
                newStreak = 1;
            }
        }

        // Save or update the user's streak and last quiz date in the 'userStreaks' collection
        await setDoc(streakDocRef, {
            streak: newStreak,
            lastQuizDate: quizDate,  // Save quizDate as a string or Date object consistently
            lastQuizScore: score,  // Ensure the correct score is saved
            username: username,
        }, { merge: true });

        // Save the final quiz score in the 'quizScores' collection with userId and quizDate as the document ID
        const quizDocRef = doc(db, 'quizScores', `${userId}_${quizDate}`); // More specific document name
        await setDoc(quizDocRef, {
            userId,
            username,
            score,  // Correct score
            totalScore,  // Total possible score
            quizDate,
            timestamp: new Date()  // UTC timestamp is sufficient
        }, { merge: true }); // Merge ensures no accidental overwriting

        // NEW LOGIC: Save the quiz attempt to the 'quizAttempts' collection
        const quizAttemptDocRef = doc(db, 'quizAttempts', `${userId}_${quizDate}`);
        await setDoc(quizAttemptDocRef, {
            userId,
            quizDate,
            score,
            totalScore,
            timestamp: new Date(),
            answers: {} // Optionally save answers if needed
        });

        console.log('Quiz score, streak, and attempt updated successfully!');
    } catch (error) {
        console.error('Error saving quiz score or attempt:', error);
    }
};
