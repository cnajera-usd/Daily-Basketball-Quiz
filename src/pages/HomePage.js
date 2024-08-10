import React from 'react';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="container">
      <div className="hero">
        <img src="/images/Kobe Dunking.avif" alt="Kobe performing dunk" className="kobe-image" />
        <h1>Welcome to the NBA Daily Quiz</h1>
        <p>Test your NBA knowledge with a new quiz every day!</p>
      </div>
      <div className="introduction">
        <h2>About the NBA Daily Quiz</h2>
        <p>
          Welcome to the NBA Daily Quiz! Every day, we present you with a fresh quiz featuring 10 new questions about the NBA. From historical moments and legendary players to current stats and team trivia, there's always something new to learn and explore. Which is the entire purpose of this website; this website was created for people that want to many different ways to challenge or expand their NBA knowledge.
        </p>
        <p>
          Whether you're a casual fan or a hardcore basketball sicko, our quizzes are designed to challenge and entertain. Compete against your friends, climb the leaderboard, and improve your understanding of the game. Join our community of passionate basketball fans and take your NBA knowledge to the next level!
        </p>
      </div>
      <div className="cta">
        <button className="btn-primary">Take Today's Quiz</button>
      </div>
    </div>
  );
};

export default HomePage;
