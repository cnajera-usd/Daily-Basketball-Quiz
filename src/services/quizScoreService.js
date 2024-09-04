import { db } from '../firebaseConfig'; // Import Firebase Firestore configuration
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
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

            // Check if the last quiz date was yesterday to continue the streak
            if (moment(lastQuizDate).isSame(moment(quizDate).subtract(1, 'days'), 'day')) {
                newStreak = streak + 1;
            } else if (!moment(lastQuizDate).isSame(moment(quizDate), 'day')) {
                // Reset streak if the quiz date is not consecutive
                newStreak = 1;
            }
        }

        // Save or update the user's streak and last quiz date in the 'userStreaks' collection
        await setDoc(streakDocRef, {
            streak: newStreak,
            lastQuizDate: quizDate,
            lastQuizScore: score,  // Use the correct score here
            username: username,
        }, { merge: true });

        // Save the final quiz score in the 'quizScores' collection
        const quizCollection = collection(db, 'quizScores');
        await addDoc(quizCollection, {
            userId,
            username,
            score,  // Ensure the correct score is being saved
            totalScore,  // Total possible score
            quizDate,
            timestamp: new Date(),  // Correct timezone for the timestamp
        });

        console.log('Quiz score and streak updated successfully!');
    } catch (error) {
        console.error('Error saving quiz score:', error);
    }
};
