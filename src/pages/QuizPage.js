import React, { useState, useEffect } from 'react';
import '../styles/QuizPage.css';


const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch('/api/quiz');
        if (response.ok) {
          const data = await response.json();
          setQuizQuestions(data.quesitons);
        } else {
          console.error('Failed to fetch quiz data');
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData();
  }, []);

  const handleAnswerClick = (index) => {
    setSelectedAnswerIndex(index);
    setFeedback(null);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = selectedAnswerIndex === quizQuestions[currentQuestionIndex].correctAnswerIndex;
    setFeedback(isCorrect ? 'Correct!' : 'Incorrect.');
  };

  const handleNextQuestion = () => {
    setFeedback('');
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setFeedback('');
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">NBA Daily Quiz</h1>
      {quizQuestions.length > 0 ? (
        <div>
          <div className="question-section">
            <p className="question-text">
              {quizQuestions[currentQuestionIndex].question}
            </p>
            <div className="answer-options">
              {quizQuestions[currentQuestionIndex].answers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-button ${selectedAnswerIndex === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerClick(index)}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
          {feedback && (
            <p className="feedback">{feedback}</p>
          )}

          <div className="action-buttons">
            {currentQuestionIndex > 0 && (
              <button className='nav-button' onClick={handlePreviousQuestion}>
                Previous Question
              </button>
            )}
            <button className="nav-button submit-button" onClick={handleSubmitAnswer}>
              Submit
            </button>
            {currentQuestionIndex < quizQuestions.length - 1 && (
              <button className="nav-button" onClick={handleNextQuestion}>
                Next Question
              </button>
            )}
          </div>
          {currentQuestionIndex >= quizQuestions.length - 1 && (
            <p className="completed-message">You’ve completed the quiz! 
            Make sure to come back tomorrow for the next Daily NBA Quiz :)</p>
          )}
        </div>
      ) : (
        <p>No quiz available for today. Please check back later!</p>
      )}
    </div>
  );
};

export default QuizPage;
