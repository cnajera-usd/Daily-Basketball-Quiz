import React, { useState, useEffect } from 'react';
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
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
        console.log(`Calculated Today Date: ${today}`);

        const userId = auth.currentUser?.uid || "anonymous";
        const docName = `${userId}_${today}`;
        console.log(`Checking Firestore Document: ${docName}`);

        const questions = quizData[today]?.questions || [];
        if (questions.length === 0) {
          console.warn('No questions found for today\'s date in quizData.');
        }
        setQuizQuestions(questions);

        const attemptDoc = await getDoc(doc(db, 'quizAttempts', docName));
        console.log(`Quiz Attempt Exists for ${docName}: ${attemptDoc.exists()}`);

        if (attemptDoc.exists()) {
          setHasAttempted(true);
          console.log("Quiz attempt found, setting hasAttempted to true.");
        } else {
          setIsReviewMode(false);
          console.log("No previous attempt, setting isReviewMode to false.");
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    const checkQuizAttempt = async () => {
      const userId = auth.currentUser?.uid || "anonymous";
      const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');

      const attemptDoc = await getDoc(doc(db, 'quizAttempts', `${userId}_${today}`));
      console.log(`Attempt Doc Exists for ${userId}_${today}: ${attemptDoc.exists()}`);

      if (attemptDoc.exists()) {
        setHasAttempted(true);
        console.log("Quiz attempt found, setting hasAttempted to true.");
      } else {
        setIsReviewMode(false);
        console.log("No previous attempt, setting isReviewMode to false.");
        fetchQuizData();
      }
    };

    checkQuizAttempt();
  }, []);

  const handleReviewClick = async () => {
    console.log("Review button clicked");
    const userId = auth.currentUser?.uid || "anonymous";
    const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
    const docName = `${userId}_${today}`;

    try {
      const attemptDoc = await getDoc(doc(db, 'quizAttempts', docName));

      if (attemptDoc.exists()) {
        console.log("Fetched attemptDoc data:", attemptDoc.data());
        const userAnswers = attemptDoc.data().answers || {}; // Check if the 'answers' field exists
        setAnswers(userAnswers); // Loading the saved answers
        setIsReviewMode(true);
        setHasCompletedQuiz(true);
        setShowScoreModal(false);
        setCurrentQuestionIndex(0); // Start reviewing from the first question
        console.log("Set to review mode, answers loaded:", userAnswers);
      } else {
        console.error("No previous answers found for review.");
      }
    } catch (error) {
      console.error('Error loading previous answers:', error);
    }
  };

  useEffect(() => {
    const saveAttempt = async () => {
      if (hasCompletedQuiz) {
        const userId = auth.currentUser?.uid || "anonymous";
        const username = auth.currentUser?.displayName || "Unknown User";
        const quizDate = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');

        await setDoc(doc(db, 'quizAttempts', `${userId}_${quizDate}`), {
          userId: userId,
          username: username,
          quizDate: quizDate,
          timestamp: moment().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss'),
          answers: answers,  // Ensure this field isn't undefined
        });

        saveQuizScore(userId, username, score, quizQuestions.length, quizDate);
      }
    };

    saveAttempt();
  }, [hasCompletedQuiz, score, quizQuestions, answers]);

  const handleAnswerClick = (index) => {
    console.log(`Answer clicked: ${index}`);
    setSelectedAnswerIndex(index);
    setFeedback(null);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;

      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: {
          selectedAnswerIndex,
          feedback
        },
      }));

      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswerIndex(null); // Reset selection for the new question
      setFeedback(null); // Reset feedback

      const nextAnswer = answers[nextIndex];
      setSelectedAnswerIndex(nextAnswer?.selectedAnswerIndex || null);
      setFeedback(nextAnswer?.feedback || null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      const prevAnswer = answers[prevIndex];
      setSelectedAnswerIndex(prevAnswer?.selectedAnswerIndex || null);
      setFeedback(prevAnswer?.feedback || null);
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
      setScore((prevScore) => prevScore + 1);
    }
  
    if (currentQuestionIndex === quizQuestions.length - 1) {
      // Final question submitted, mark quiz as completed
      setHasCompletedQuiz(true);
      setShowScoreModal(true);
  
      // Call saveQuizScore after the quiz is marked as completed
      const userId = auth.currentUser?.uid || "anonymous";
      const username = auth.currentUser?.displayName || "Unknown User";
      const quizDate = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
      
      saveQuizScore(userId, username, score + (isCorrect ? 1 : 0), quizQuestions.length, quizDate);
    }
  };
  

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Daily NBA Quiz</h1>
      {hasAttempted ? (
        <div>
          <p>You have already taken today's quiz. Please come back tomorrow when a new quiz will be available!</p>
          <button onClick={handleReviewClick} className="review-button">
            Review Your Answers
          </button>
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
                const isCorrect = selectedAnswerIndex === correctAnswerIndex;

                // Determine if this is the selected answer during the review mode
                const isSelectedAnswer = selectedAnswerIndex === index;

                return (
                  <button
                    key={index}
                    className={`answer-button ${isSelectedAnswer ? 'selected' : ''} ${feedback && index === correctAnswerIndex ? 'correct' : ''} ${feedback && selectedAnswerIndex === index && !isCorrect ? 'incorrect' : ''}`}
                    onClick={() => !isReviewMode && handleAnswerClick(index)}
                    disabled={isReviewMode}
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
            <button
              className="nav-button submit-button"
              onClick={handleSubmitAnswer}
              disabled={hasCompletedQuiz || isReviewMode}
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
