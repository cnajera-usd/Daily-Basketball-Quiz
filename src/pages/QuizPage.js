import React, { useState, useEffect } from 'react';
import '../styles/QuizPage.css';
import quizData from '../data/quizData.json';
import ScoreModal from '../components/ScoreModal'; // Adjust path as necessary
import { auth } from '../firebaseConfig';
import { saveQuizScore } from '../services/quizScoreService';

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0); // State for total possible score
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false); 

  useEffect(() => {
      const fetchQuizData = async () => {
          try {
              const today = new Date().toLocaleDateString('en-CA'); 
              const questions = quizData[today]?.questions || [];
              setQuizQuestions(questions); 

              // Calculate total possible score based on the quiz's difficulties
              let possibleScore = 0;
              questions.forEach(question => {
                  switch (question.difficulty) {
                      case 'Easy':
                          possibleScore += 1;
                          break;
                      case 'Medium':
                          possibleScore += 2;
                          break;
                      case 'Hard':
                          possibleScore += 3;
                          break;
                      case 'Challenging':
                          possibleScore += 4;
                          break;
                      default:
                          possibleScore += 1; // Fallback if difficulty is undefined
                  }
              });
              setTotalPossibleScore(possibleScore); // Set total possible score
          } catch (error) {
              console.error('Error fetching quiz data:', error);
          }
      };

      fetchQuizData();
  }, []);

  // New useEffect to handle saving the score once the quiz is completed
  useEffect(() => {
      if (hasCompletedQuiz) {
          const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";
          saveQuizScore(userId, score, totalPossibleScore, new Date().toLocaleDateString('en-CA'));
      }
  }, [hasCompletedQuiz, score, totalPossibleScore]);

  const handleAnswerClick = (index) => {
    setSelectedAnswerIndex(index);
    setFeedback(null); // Clear previous feedback
  };

  const handleNextQuestion = () => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setSelectedAnswerIndex(null); // Reset the selected answer
          setFeedback(null); // Clear feedback for the new question
      }
  };

  const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
          const prevIndex = currentQuestionIndex - 1;
          setCurrentQuestionIndex(prevIndex);
          setSelectedAnswerIndex(answers[prevIndex]?.selectedAnswerIndex || null);
          setFeedback(answers[prevIndex]?.feedback || null);
      }
  };

  const closeScoreModal = () => {
      setShowScoreModal(false);
  };

  const handleSubmitAnswer = () => {
      if (hasCompletedQuiz) return;

      const isCorrect = selectedAnswerIndex === quizQuestions[currentQuestionIndex]?.correctAnswerIndex;

      setAnswers((prevAnswers) => ({
          ...prevAnswers,
          [currentQuestionIndex]: {
              selectedAnswerIndex,
              feedback: isCorrect ? 'Correct!' : 'Incorrect.',
          },
      }));

      setFeedback(isCorrect ? 'Correct!' : 'Incorrect.');

      if (isCorrect) {
          const difficulty = quizQuestions[currentQuestionIndex]?.difficulty;
          let points = 0;

          switch (difficulty) {
              case 'Easy':
                  points = 1;
                  break;
              case 'Medium':
                  points = 2;
                  break;
              case 'Hard':
                  points = 3;
                  break;
              case 'Challenging':
                  points = 4;
                  break;
              default:
                  points = 1; 
          }

          setScore((prevScore) => prevScore + points);
      }

      if (currentQuestionIndex === quizQuestions.length - 1) {
          setHasCompletedQuiz(true);
          setShowScoreModal(true);
      }
  };

  return (
      <div className="quiz-container">
          <h1 className="quiz-title">Daily NBA Quiz</h1>
          {quizQuestions.length > 0 ? (
              <div>
                  <div className="question-section">
                      <p className="question-text">
                          {quizQuestions[currentQuestionIndex]?.question}
                      </p>
                      <div className="answer-options">
                          {quizQuestions[currentQuestionIndex]?.answers.map((answer, index) => (
                              <button
                                  key={index}
                                  className={`answer-button ${selectedAnswerIndex === index ? 'selected' : ''}`}
                                  onClick={() => handleAnswerClick(index)}
                                  disabled={feedback !== null} 
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
                      <button
                          className="nav-button submit-button"
                          onClick={handleSubmitAnswer}
                          disabled={hasCompletedQuiz} 
                      >
                          Submit
                      </button>

                      {currentQuestionIndex < quizQuestions.length - 1 && (
                          <button className="nav-button" onClick={handleNextQuestion}>
                              Next Question
                          </button>
                      )}
                  </div>
                  {hasCompletedQuiz && (
                    <p className='final-score'>Your Final Score: {score}/{totalPossibleScore}</p>
                  )}
              </div>
          ) : (
              <p>No quiz available for today. Please check back later!</p>
          )}
          {showScoreModal && (
              <ScoreModal 
                  score={score}
                  totalQuestions={totalPossibleScore} // Display the total possible score
                  onClose={closeScoreModal}
              />
          )}
      </div>
  );
};

export default QuizPage;
