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
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null); // Will be set/reset correctly now
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const localStorageKey = 'nba_quiz_state';
  const localStorageDateKey = 'quizCompletedDate';
  const user = auth.currentUser;
  const today = moment.tz('America/Los_Angeles').format('YYYY-MM-DD'); // Store date in PST

  // Load the quiz state from localStorage
  const loadQuizState = useCallback(() => {
    const savedState = localStorage.getItem(localStorageKey);
    const savedDate = localStorage.getItem(localStorageDateKey); // Get the saved quiz date

    // Check if the user has already taken today's quiz
    if (savedDate === today) {
      console.log('Quiz already completed today. Blocking the quiz.');
      setHasAttempted(true);
      return;
    }

    // Load saved state if it exists
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('Loaded state from localStorage:', parsedState);

      setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0);
      setAnswers(parsedState.answers || {});
      setScore(parsedState.score || 0);
      setHasCompletedQuiz(parsedState.hasCompletedQuiz || false);

      const savedAnswer = parsedState.answers[parsedState.currentQuestionIndex];
      if (savedAnswer) {
        setSelectedAnswerIndex(savedAnswer.selectedAnswerIndex);
      }
    } else {
      console.log('No saved state in localStorage');
    }
  }, [today]);

  // Save the current quiz state and the date it was completed
  const saveQuizState = useCallback(() => {
    const quizState = {
      currentQuestionIndex,
      answers,
      score,
      hasCompletedQuiz,
    };
    localStorage.setItem(localStorageKey, JSON.stringify(quizState));
    console.log('Quiz state saved to localStorage:', quizState);

    // Also save the date when the quiz was completed
    if (hasCompletedQuiz) {
      localStorage.setItem(localStorageDateKey, today);
      console.log('Quiz completion date saved to localStorage:', today);
    }
  }, [currentQuestionIndex, answers, score, hasCompletedQuiz, today]);

  useEffect(() => {
    loadQuizState();
  }, [loadQuizState]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const questions = quizData[today]?.questions || [];
        if (questions.length === 0) {
          console.warn("No questions found for today's date in quizData.");
        }
        setQuizQuestions(questions);

        setIsAuthenticated(!!user);

        if (user) {
          const userId = user.uid;
          const docName = `${userId}_${today}`;
          const attemptDoc = await getDoc(doc(db, 'quizAttempts', docName));

          if (attemptDoc.exists()) {
            setHasAttempted(true);
            console.log('Quiz attempt found, setting hasAttempted to true.');
          }
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [today, user]);

  // Save the quiz state to localStorage after each question is answered
  useEffect(() => {
    if (!hasCompletedQuiz) {
      console.log('Saving quiz state to localStorage after each question...');
      saveQuizState();
    }
  }, [currentQuestionIndex, answers, score, hasCompletedQuiz, saveQuizState]);

  // Handle answer selection
  const handleAnswerClick = (index) => {
    if (hasCompletedQuiz || answers[currentQuestionIndex]?.isSubmitted) return;

    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: {
        selectedAnswerIndex: index,
      },
    };
    setAnswers(updatedAnswers);
    setSelectedAnswerIndex(index);
    saveQuizState(); // Save progress after selecting an answer
  };

  // Function to handle moving to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length -1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);

      // Load selected answer for the next question if it exists, else reset
      const nextAnswer = answers[currentQuestionIndex + 1];
      setSelectedAnswerIndex(nextAnswer?.selectedAnswerIndex ?? null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);

      // Load selected answer for the previous question
      const prevAnswer = answers[currentQuestionIndex - 1];
      setSelectedAnswerIndex(prevAnswer?.selectedAnswerIndex ?? null);
    }
  };

  // Handle quiz submission
  const handleSubmitAnswer = async () => {
    if (hasCompletedQuiz || answers[currentQuestionIndex]?.isSubmitted) return;

    if (selectedAnswerIndex === null) {
      alert('Please select an answer before submitting.');
      return;
    }

    const correctAnswerIndex = quizQuestions[currentQuestionIndex]?.correctAnswerIndex;
    const isCorrect =
      selectedAnswerIndex === correctAnswerIndex;

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: {
        selectedAnswerIndex,
        correctAnswerIndex,  // Store the correct answer index
        feedback: isCorrect ? 'Correct!' : 'Incorrect.',
        isSubmitted: true,
      },
    }));

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    saveQuizState(); // Save the state after submission

    // If it's the last question, mark the quiz as completed and save the result
    if (currentQuestionIndex === quizQuestions.length - 1) {
      setHasCompletedQuiz(true);
      setShowScoreModal(true);

      // Call the saveQuizScore function to save score to your backend (Firestore)
      if (isAuthenticated) {
        const userId = auth.currentUser?.uid || "anonymous";
        const username = auth.currentUser?.displayName || "Unknown User";
        const quizDate = moment.tz('America/Los_Angeles').format('YYYY-MM-DD');
        const docRef = doc(db, 'quizAttempts', `${userId}_${quizDate}`);

        // Save the quiz result to Firestore
        await setDoc(docRef, {
          userId,
          username,
          quizDate,
          score: score + (isCorrect ? 1 : 0), // Add the last question's score
          totalQuestions: quizQuestions.length,
          answers
        });

        console.log('Quiz result saved to Firestore');

        // Optionally, use saveQuizScore function if you have a backend service to store scores
        await saveQuizScore(userId, username, score + (isCorrect ? 1 : 0), quizQuestions.length, quizDate);
      }
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Daily NBA Quiz</h1>
      {hasAttempted ? (
        <div>
          <p>
            You have already taken today's quiz. Please come back tomorrow when a new quiz will be
            available!
          </p>
        </div>
      ) : quizQuestions.length > 0 ? (
        <div>
          {/* Quiz Question and Answers */}
          <div className="question-section">
            <p className="question-text">
              {quizQuestions[currentQuestionIndex]?.question}
            </p>
            <div className="answer-options">
              {quizQuestions[currentQuestionIndex]?.answers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-button ${
                    answers[currentQuestionIndex]?.isSubmitted &&
                    index === quizQuestions[currentQuestionIndex]?.correctAnswerIndex
                      ? 'correct' // Highlight correct answer
                      : selectedAnswerIndex === index
                      ? answers[currentQuestionIndex]?.isSubmitted && !answers[currentQuestionIndex].feedback.includes('Correct')
                        ? 'incorrect' // Highlight selected incorrect answer
                        : 'selected' // Highlight selected answer
                      : ''
                  }`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={answers[currentQuestionIndex]?.isSubmitted}  // Disable after submitting
                >
                  {answer}
                </button>
              ))}
            </div>

            {/* Feedback after submitting */}
            {answers[currentQuestionIndex]?.isSubmitted && (
              <p className="feedback">
                {answers[currentQuestionIndex]?.feedback}
              </p>
            )}
          </div>
  
          {/* Action Buttons */}
          <div className="action-buttons">
            {currentQuestionIndex > 0 && (
              <button
                className="nav-button"
                onClick={handlePreviousQuestion}
              >
                Previous Question
              </button>
            )}

            {answers[currentQuestionIndex]?.isSubmitted && currentQuestionIndex < quizQuestions.length - 1 && (
              <button
                className="nav-button"
                onClick={handleNextQuestion}
              >
                Next Question
              </button>
            )}

            {!answers[currentQuestionIndex]?.isSubmitted && (
              <button
                className="nav-button submit-button"
                onClick={handleSubmitAnswer}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>No quiz available for today. Please check back later!</p>
      )}

      {/* Score Modal */}
      {showScoreModal && (
        <ScoreModal
          score={score}
          totalQuestions={quizQuestions.length}
          onClose={() => setShowScoreModal(false)}
        />
      )}
    </div>
  );
}

export default QuizPage;
