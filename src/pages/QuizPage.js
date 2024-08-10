import React, { useState, useEffect } from 'react';
import '../styles/QuizPage.css';
import quizData from '../data/quizData.json';

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
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
    setSelectedAnswerIndex(index);
    setFeedback(null);
  }

  const handleSubmitAnswer = () => {
    const isCorrect = selectedAnswerIndex === quizQuestions[currentQuestionIndex].correctAnswerIndex;
    setFeedback(isCorrect ? 'Correct!' : 'Incorrect.');
  };

  const handleNextQuestion = () => {
    setFeedback('');
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <div className="quiz-container">
        <h1 className="quiz-title">NBA Daily Quiz</h1>
        {quizQuestions.length > 0 ? (
            <div>
                <div className="question-section">
                    <p className="question-text">{quizQuestions[currentQuestionIndex].question}</p>
                    <div className="answer-options">
                        {quizQuestions[currentQuestionIndex].answers.map((answer, index) => (
                            <button
                                key={index}
                                className={`answer-button ${selectedAnswerIndex === index ? "selected" : ""}`}
                                onClick={() => handleAnswerClick(index)}
                            >
                                {answer}
                            </button>
                        ))}
                    </div>
                    <button className="submit-button" onClick={handleSubmitAnswer}>
                        Submit
                    </button>
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
            </div>
        ) : (
            <p>No quiz available for today. Please check back later!</p>
        )}
    </div>
);
};

export default QuizPage;