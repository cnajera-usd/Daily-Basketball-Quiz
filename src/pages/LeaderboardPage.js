// src/pages/LeaderboardPage.js

import React from 'react';
import './Leaderboard.css'; // Make sure this file exists
import UserScores from '../components/UserScores';

const LeaderboardPage = ({ scores, currentUser }) => {
    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <h3>Top Scores</h3>
            <ul>
                {scores.map((score, index) => (
                    <li key={score.id} className={`leaderboard-item ${score.username === currentUser ? 'highlight' : ''}`}>
                        <span className="rank">{index + 1}</span>
                        <img src={score.userAvatar || 'default-avatar.png'} alt="User Avatar" className="avatar" />
                        <span className="username">{score.username || 'Unknown User'}</span>
                        <span className="score">{score.score}/10</span>
                        <span className="date">{score.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeaderboardPage;

