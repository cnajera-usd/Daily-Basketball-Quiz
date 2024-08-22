// src/pages/LeaderboardPage.js

import React from 'react';
import UserScores from '../components/UserScores'; // Corrected import path

const LeaderboardPage = () => {
    return (
        <div>
            <h1>Leaderboard</h1>
            {/* Display the UserScores component here */}
            <UserScores />
        </div>
    );
};

export default LeaderboardPage;
