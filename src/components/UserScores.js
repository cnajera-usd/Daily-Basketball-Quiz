import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserScores = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            const q = query(collection(db, 'quizScores'), orderBy('score', 'desc'));
            const querySnapshot = await getDocs(q);
            const scoresList = querySnapshot.docs.map(doc => doc.data());
            setScores(scoresList);
        };
    
        fetchScores();
    }, []);
    
    return (
        <div>
            <h2>Top Scores</h2>
            <ul>
                {scores.map((score, index) => (
                    <li key={index}>
                        {/* Display user ID, score, total score, and the quiz date */}
                        {score.userId}: {score.score}/{score.totalScore} on {score.quizDate}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserScores;