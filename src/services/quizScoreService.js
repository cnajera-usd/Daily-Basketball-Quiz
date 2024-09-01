import { db } from '../firebaseConfig'; // Import Firebase Firestore configuration
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import moment from 'moment-timezone';

export const saveQuizScore = async (userId, username, score, totalScore, quizDate) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        let newStreak = 1;
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const lastQuizDate = userData.lastQuizDate || '';
            const streak = userData.streak || 0;

            // Check if the last quiz date was yesterday
            if (moment(lastQuizDate).isSame(moment(quizDate).subtract(1, 'days'), 'day')) {
                newStreak = streak + 1;
            } else if (!moment(lastQuizDate).isSame(moment(quizDate), 'day')) {
                // Reset streak if the quiz date is not consecutive
                newStreak = 1;
            }
        }

        // Save/update user's streak and last quiz date
        await setDoc(userDocRef, {
            streak: newStreak,
            lastQuizDate: quizDate,
            username: username,
        }, { merge: true });

        // Save the quiz score in the quizScores collection
        const quizCollection = collection(db, 'quizScores');
        await addDoc(quizCollection, {
            userId,
            username,
            score,
            totalScore,
            quizDate,
            timestamp: new Date(),
        });

        console.log('Quiz score and streak updated successfully!');
    } catch (error) {
        console.error('Error saving quiz score:', error);
    }
};
