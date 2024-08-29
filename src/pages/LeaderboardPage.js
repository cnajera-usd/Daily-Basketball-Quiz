import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Make sure firebaseConfig is correctly configured
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import '../styles/Leaderboard.css';

const LeaderboardPage = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const scoresQuery = query(
                    collection(db, 'quizScores'),
                    orderBy('score', 'desc'),  // Order by score in descending order
                    limit(10)  // Limit to top 10 scores
                );
                const querySnapshot = await getDocs(scoresQuery);
                const scoresList = querySnapshot.docs.map(doc => doc.data());
                setScores(scoresList);
            } catch (error) {
                console.error('Error fetching scores:', error);
            }
        };

        fetchScores();
    }, []);

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <h3>Top Scores</h3>
            <ul>
                {scores.map((score, index) => (
                    <li key={index} className="leaderboard-item">
                        <span className="rank">{index + 1}</span>
                        <span className="username">{score.username || 'Unknown User'}</span>
                        <span className="score">{score.score}/10</span>
                        <span className="date">{new Date(score.quizDate).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeaderboardPage;
