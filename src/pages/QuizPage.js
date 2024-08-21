import React, { useState, useEffect } from 'react';
import '../styles/QuizPage.css';
import quizData from '../data/quizData.json';
import ScoreModal from '../components/ScoreModal'; // Adjust path as necessary


const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false); // Initialize with false


  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const today = new Date().toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
        setQuizQuestions(quizData[today]?.questions || []); // Load today's quiz questions
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData(); // Load quiz data on component mount
  }, []);

  const handleAnswerClick = (index) => {
    setSelectedAnswerIndex(index); // Set the selected answer index
    setFeedback(null); // Clear feedback
  };

  const handleSubmitAnswer = () => {
    // Prevent further submissions if the quiz is completed
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

    // If this is the last question, set the quiz as completed
    if (currentQuestionIndex === quizQuestions.length - 1) {
        setHasCompletedQuiz(true);
        setShowScoreModal(true);
    }
};

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
  
      // Retrieve the next question's stored answer and feedback if available
      const nextQuestionAnswer = answers[nextIndex] || { selectedAnswerIndex: null, feedback: null };
  
      setFeedback(nextQuestionAnswer.feedback); // Set feedback for the next question
      setSelectedAnswerIndex(nextQuestionAnswer.selectedAnswerIndex); // Set the previously selected answer

      setCurrentQuestionIndex(nextIndex); // Move to the next question
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
  
      // Restore the previous question's stored answer and feedback
      const prevQuestionAnswer = answers[prevIndex] || { selectedAnswerIndex: null, feedback: null };
  
      setFeedback(prevQuestionAnswer.feedback); // Set feedback for the previous question
      setSelectedAnswerIndex(prevQuestionAnswer.selectedAnswerIndex); // Set the previously selected answer
  
      setCurrentQuestionIndex(prevIndex); // Move to the previous question
    }
  };

  const closeScoreModal = () => {
    setShowScoreModal(false); // Close the modal when the user clicks close
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
                  disabled={feedback !== null} // Disable buttons after submission
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
              disabled={hasCompletedQuiz}  // Disable if the quiz is completed
            >
              Submit
            </button>

            {currentQuestionIndex < quizQuestions.length - 1 && (
              <button className="nav-button" onClick={handleNextQuestion}>
                Next Question
              </button>
            )}
          </div>
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
