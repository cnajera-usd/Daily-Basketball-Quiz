import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import '../styles/Leaderboard.css';
import moment from 'moment-timezone';

const LeaderboardPage = () => {
    const [streaks, setStreaks] = useState([]);

    useEffect(() => {
        const fetchStreaks = async () => {
            try {
                const scoresQuery = query(
                    collection(db, 'users'),
                    orderBy('streak', 'desc'),
                    limit(10)
                );
                const querySnapshot = await getDocs(scoresQuery);
                const streaksList = querySnapshot.docs.map(doc => doc.data());
                setStreaks(streaksList);
            } catch (error) {
                console.error('Error fetching scores:', error);
            }
        };

        fetchStreaks();
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
            <h3>Top Streaks</h3>
            <ul>
                {streaks.map((user, index) => (
                    <li key={index} className="leaderboard-item">
                        <span className="rank">{index + 1}</span>
                        <span className="username">{user.username || 'Unknown User'}</span>
                        <span className="streak">{user.streak} days</span>
                        <span className="date">
                            Last Quiz: {formatDate(user.lastQuizDate)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeaderboardPage;