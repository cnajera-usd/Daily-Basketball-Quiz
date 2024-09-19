import React, { useState, useEffect, useCallback } from 'react';
import '../styles/QuizPage.css';
import quizData from '../data/quizData.json';
import ScoreModal from '../components/ScoreModal';
import { auth } from '../firebaseConfig';
import { saveQuizScore } from '../services/quizScoreService';
import moment from 'moment-timezone';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import 'moment-timezone/data/packed/latest.json';

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const localStorageKey = 'nba_quiz_state';
  const user = auth.currentUser;
  const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');

  // Function to clear the quiz state from localStorage and Firestore
  const clearQuizState = async () => {
    if (!user) return;

    // Clear localStorage
    localStorage.removeItem(localStorageKey);

    // Clear quiz state from Firestore
    const docRef = doc(db, 'quizAttempts', `${user.uid}_${today}`);
    await setDoc(docRef, {
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
    });

    console.log('Quiz state cleared from both localStorage and Firestore');
  };

  // Load the quiz state from localStorage
  const loadQuizState = useCallback(() => {
    const savedState = localStorage.getItem(localStorageKey);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('Loaded state from localStorage:', parsedState);

      setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0);
      setAnswers(parsedState.answers || {});
      setScore(parsedState.score || 0);

      const savedAnswer = parsedState.answers[parsedState.currentQuestionIndex];
      if (savedAnswer) {
        setSelectedAnswerIndex(savedAnswer.selectedAnswerIndex);
      }
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

  useEffect(() => {
    loadQuizState();
  }, [loadQuizState]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const questions = quizData[today]?.questions || [];
        if (questions.length === 0) {
          console.warn('No questions found for today\'s date in quizData.');
        }
        setQuizQuestions(questions);

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
  }, []);

  useEffect(() => {
    if (!hasCompletedQuiz) {
      console.log('Saving quiz state to localStorage after each question...');
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
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: {
        selectedAnswerIndex: index,
      },
    };
    setAnswers(updatedAnswers);
    setSelectedAnswerIndex(index);
    saveQuizState();  // Save after answering
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswer = () => {
    if (hasCompletedQuiz || answers[currentQuestionIndex]?.isSubmitted) return;

    const isCorrect = selectedAnswerIndex === quizQuestions[currentQuestionIndex]?.correctAnswerIndex;

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: {
        selectedAnswerIndex,
        feedback: isCorrect ? 'Correct!' : 'Incorrect.',
        isSubmitted: true,
      },
    }));

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    saveQuizState();

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
              {quizQuestions[currentQuestionIndex]?.answers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-button ${selectedAnswerIndex === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={answers[currentQuestionIndex]?.isSubmitted}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
          <div className="action-buttons">
            {currentQuestionIndex > 0 && (
              <button className='nav-button' onClick={handlePreviousQuestion}>
                Previous Question
              </button>
            )}
            <button
              className="nav-button submit-button"
              onClick={handleSubmitAnswer}
              disabled={answers[currentQuestionIndex]?.isSubmitted}
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
