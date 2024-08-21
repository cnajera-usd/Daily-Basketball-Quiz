import React from 'react';
import '../styles/QuizPage.css';

const ScoreModal = ({ score, totalQuestions, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Quiz Completed! Make sure to comeback tomorrow and take the next Daily NBA Quiz!</h2>
        <p>Your Score: {score}/{totalQuestions}</p>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default ScoreModal;
