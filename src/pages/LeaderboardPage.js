import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import '../styles/Leaderboard.css';
import moment from 'moment-timezone';

const LeaderboardPage = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const scoresQuery = query(
                    collection(db, 'quizScores'),
                    orderBy('score', 'desc'),
                    limit(10)
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

    const formatDate = (timestamp) => {
        if (timestamp instanceof Date) {
            // If it's already a Date object
            return moment.tz(timestamp, 'America/Los_Angeles').format('MM/DD/YYYY');
        } else if (typeof timestamp === 'string') {
            // If it's a string
            return moment.tz(new Date(timestamp), 'America/Los_Angeles').format('MM/DD/YYYY');
        } else if (timestamp && timestamp.toDate) {
            // If it's a Firestore Timestamp object
            return moment.tz(timestamp.toDate(), 'America/Los_Angeles').format('MM/DD/YYYY');
        } else {
            return 'Invalid date';
        }
    };

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
                        <span className="date">
                            {formatDate(score.timestamp)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeaderboardPage;
