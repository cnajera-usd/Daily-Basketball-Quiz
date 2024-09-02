import { db } from '../firebaseConfig'; // Import Firebase Firestore configuration
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import moment from 'moment-timezone';

export const saveQuizScore = async (userId, username, score, totalScore) => {
    try {
        // Get the current date in the correct time zone
        const formattedQuizDate = moment().tz('America/Los_Angeles').format('YYYY-MM-DD');
        
        // Fetch the user's data from the 'users' collection
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        let newStreak = 1;
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const lastQuizDate = userData.lastQuizDate || '';
            const streak = userData.streak || 0;

            // Check if the last quiz date was yesterday to continue the streak
            if (moment(formattedQuizDate).diff(moment(lastQuizDate), 'days') === 1) {
                newStreak = streak + 1;
            } else if (moment(formattedQuizDate).isAfter(moment(lastQuizDate), 'day')) {
                // Reset streak if the quiz date is not consecutive
                newStreak = 1;
            }
        }

        // Save or update the user's streak and last quiz date in the 'users' collection
        await setDoc(userDocRef, {
            streak: newStreak,
            lastQuizDate: formattedQuizDate,
            username: username,
        }, { merge: true });

        // Save the quiz score in the 'quizScores' collection
        const quizCollection = collection(db, 'quizScores');
        await addDoc(quizCollection, {
            userId,
            username,
            score,
            totalScore,
            quizDate: formattedQuizDate,
            timestamp: moment().tz('America/Los_Angeles').toDate(),  // Correct timezone for the timestamp
        });

        console.log('Quiz score and streak updated successfully!');
    } catch (error) {
        console.error('Error saving quiz score:', error);
    }
};
