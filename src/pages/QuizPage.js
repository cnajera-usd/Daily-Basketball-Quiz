import React, { useState, useEffect } from 'react';
import '../styles/QuizPage.css';
import quizData from '../data/quizData.json';

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (quizData[today]) {
      setQuizQuestions(quizData[today].questions);
    } else {
      // Handle the case where there's no quiz data for today
      console.error("No quiz available for today!");
    }
  }, []);

  const handleAnswerClick = (index) => {
    if (index === quizQuestions[currentQuestionIndex].correctAnswerIndex) {
      setFeedback("Correct!");
    } else {
      setFeedback("Incorrect.");
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">NBA Daily Quiz</h1>
      {quizQuestions.length > 0 && (
        <>
          <div className="question-section">
            <p className="question-text">
              {quizQuestions[currentQuestionIndex].question}
            </p>
            <div className="answer-options">
              {quizQuestions[currentQuestionIndex].answers.map((answer, index) => (
                <button
                  key={index}
                  className="answer-button"
                  onClick={() => handleAnswerClick(index)}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
          {feedback && (
            <div className="feedback">
              <p>{feedback}</p>
              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button className="nav-button" onClick={handleNextQuestion}>
                  Next Question
                </button>
              ) : (
                <p>You've completed the quiz!</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizPage;
