import React, { useState, useEffect, useCallback } from 'react';
import '../styles/QuizPage.css';
import quizData from '../data/quizData.json';
import ScoreModal from '../components/ScoreModal';
import { auth } from '../firebaseConfig';
import { saveQuizScore } from '../services/quizScoreService';
import moment from 'moment-timezone';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import 'moment-timezone/data/packed/latest.json';

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const localStorageKey = 'quizState';

  // Load the quiz state from localStorage (if it exists)
  const loadQuizState = useCallback(() => {
    const savedState = localStorage.getItem(localStorageKey);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('Loaded state from localStorage:', parsedState);

      // Update all relevant states from localStorage
      setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0);
      setAnswers(parsedState.answers || {});
      setScore(parsedState.score || 0);
      const savedAnswerIndex = parsedState.answers[parsedState.currentQuestionIndex]?.selectedAnswerIndex;
      setSelectedAnswerIndex(savedAnswerIndex !== undefined ? savedAnswerIndex : null);

      console.log('Restored answers and current question from localStorage');
    } else {
      console.log('No saved state in localStorage');
    }
  }, []);

  // Save the current quiz state to localStorage
  const saveQuizState = useCallback(() => {
    const quizState = {
      currentQuestionIndex,
      answers,
      score,
    };
    localStorage.setItem(localStorageKey, JSON.stringify(quizState));
    console.log('Quiz state saved to localStorage:', quizState);
  }, [currentQuestionIndex, answers, score]);

  const clearQuizState = () => {
    localStorage.removeItem(localStorageKey);
    console.log('Quiz state cleared from localStorage');
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
        console.log(`Today's date: ${today}`);

        const questions = quizData[today]?.questions || [];
        if (questions.length === 0) {
          console.warn('No questions found for today\'s date in quizData.');
        }
        setQuizQuestions(questions);

        // Load the quiz state from localStorage
        loadQuizState();

        // Check if the user is logged in
        const user = auth.currentUser;
        setIsAuthenticated(!!user);

        if (user) {
          const userId = user.uid;
          console.log(`User is logged in with ID: ${userId}`);

          const docName = `${userId}_${today}`;
          const attemptDoc = await getDoc(doc(db, 'quizAttempts', docName));
          console.log(`Quiz attempt exists for ${docName}: ${attemptDoc.exists()}`);

          if (attemptDoc.exists()) {
            setHasAttempted(true);
            console.log("Quiz attempt found, setting hasAttempted to true.");
          } else {
            setHasAttempted(false);
            console.log("No quiz attempt found for today. Proceeding to quiz.");
          }
        } else {
          setHasAttempted(false);
          console.log("Anonymous user, quiz allowed but not tracked.");
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [loadQuizState]);

  useEffect(() => {
    if (!hasCompletedQuiz) {
      console.log('Saving quiz state to localStorage after action...');
      saveQuizState();
    }
  }, [currentQuestionIndex, answers, score, hasCompletedQuiz, saveQuizState]);

  const handleReviewClick = async () => {
    if (!isAuthenticated) {
      console.warn("Anonymous users cannot review answers.");
      return;
    }
    console.log("Review button clicked");
    const userId = auth.currentUser?.uid || "anonymous";
    const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
    const docName = `${userId}_${today}`;

    try {
      const attemptDoc = await getDoc(doc(db, 'quizAttempts', docName));

      if (attemptDoc.exists()) {
        const userAnswers = attemptDoc.data().answers || {};
        setAnswers(userAnswers);
        setHasCompletedQuiz(true);
        setShowScoreModal(false);
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error loading previous answers:', error);
    }
  };

  const handleAnswerClick = (index) => {
    setSelectedAnswerIndex(index);
    setFeedback(null);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: { selectedAnswerIndex, feedback },
      }));
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswerIndex(null);
      setFeedback(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      const prevAnswer = answers[currentQuestionIndex - 1];
      setSelectedAnswerIndex(prevAnswer?.selectedAnswerIndex || null);
      setFeedback(prevAnswer?.feedback || null);
    }
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
      setScore((prevScore) => prevScore + 1);
    }

    if (currentQuestionIndex === quizQuestions.length - 1) {
      setHasCompletedQuiz(true);
      setShowScoreModal(true);

      if (isAuthenticated) {
        const userId = auth.currentUser?.uid || "anonymous";
        const username = auth.currentUser?.displayName || "Unknown User";
        const quizDate = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
        saveQuizScore(userId, username, score + (isCorrect ? 1 : 0), quizQuestions.length, quizDate);
      }

      clearQuizState();
    }
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Daily NBA Quiz</h1>
      {hasAttempted ? (
        <div>
          <p>You have already taken today's quiz. Please come back tomorrow when a new quiz will be available!</p>
          {isAuthenticated && (
            <button onClick={handleReviewClick} className="review-button">
              Review Your Answers
            </button>
          )}
        </div>
      ) : quizQuestions.length > 0 ? (
        <div>
          <div className="question-section">
            <p className="question-text">
              {quizQuestions[currentQuestionIndex]?.question}
            </p>
            <div className="answer-options">
              {quizQuestions[currentQuestionIndex]?.answers.map((answer, index) => {
                const correctAnswerIndex = quizQuestions[currentQuestionIndex]?.correctAnswerIndex;
                const isSelectedAnswer = selectedAnswerIndex === index;

                return (
                  <button
                    key={index}
                    className={`answer-button ${isSelectedAnswer ? 'selected' : ''} ${feedback && index === correctAnswerIndex ? 'correct' : ''}`}
                    onClick={() => handleAnswerClick(index)}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </div>
          {feedback && (
            <p className={`feedback ${feedback.toLowerCase()}`}>{feedback}</p>
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
          {hasCompletedQuiz && (
            <p className='final-score'>Your Final Score: {score}/{quizQuestions.length}</p>
          )}
        </div>
      ) : (
        <p>No quiz available for today. Please check back later!</p>
      )}
      {showScoreModal && (
        <ScoreModal
          score={score}
          totalQuestions={quizQuestions.length}
          onClose={closeScoreModal}
        />
      )}
    </div>
  );
};

export default QuizPage;
