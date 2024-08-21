import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

export const saveQuizScore = async (userId, score, totalPossibleScore, quizDate) => {
    try {
        const docRef = await addDoc(collection(db, "quizScores"), {
            userId: userId,
            score: score,
            totalPossibleScore: totalPossibleScore,
            quizDate: quizDate,
            timestamp: new Date(),
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
    
};