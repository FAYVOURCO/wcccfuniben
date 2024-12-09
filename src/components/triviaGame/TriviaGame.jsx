import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './TriviaGame.css';
import { useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';


const TriviaGame = ({
  quizQuestions,
  // currentQuestionIndex,
  // showFinalScore,
  // isQuizComplete,
  // userScore,
  // handleAnswer,
  handleQuizClose,
  // feedbackMessage,
  // FeedbackColor,
  // setIsQuizOpen
  user,
  sermonPlaying,
  collection,
  document
  // sermonQuizId
}) => {

  const [correctAnswers, setCorrectAnswers] = useState(0); // State to track the number of correct answers
  const [feedbackMessage, setFeedbackMessage] = useState(""); // State to display feedback message
  const [FeedbackColor, setFeedbackColor] = useState(""); // State to display feedback message color
  const [isQuizComplete, setIsQuizComplete] = useState(false); // State to track if the quiz is complete
  const [showFinalScore, setShowFinalScore] = useState(false); // State to show the final score
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // State to track the current question index
  const [isQuizOpen, setIsQuizOpen] = useState(false); // State to track if the quiz modal is open
  const [userScore, setUserSCore] = useState('')
  const [sermonQuizId, setSermonQuizId] = useState('')

  useEffect(() => {
    setSermonQuizId(sermonPlaying.id)

  }, [sermonPlaying])

  const handleAnswer = (question, selectedAnswer) => {
    let updatedCorrectAnswers = correctAnswers; // Local variable to track updated count

    if (selectedAnswer === question.CorrectAnswer) {
      updatedCorrectAnswers += 1; // Increment the local variable
      setCorrectAnswers(updatedCorrectAnswers); // Update state asynchronously
      setFeedbackMessage("Correct!"); // Set the correct feedback message
      setFeedbackColor("green")
    } else {
      setFeedbackMessage(`Incorrect! The correct answer is: ${question.CorrectAnswer}`); // Set the incorrect feedback message
      setFeedbackColor("red")

    }

    // Move to the next question or mark quiz as complete
    setTimeout(() => {
      // Clear feedback message after a short delay when moving to the next question
      setFeedbackMessage("");

      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        setIsQuizComplete(true);
        // setIsQuizOpen(false); 
        // Close the quiz modal
        setCorrectAnswers(0);
        saveQuizResult(updatedCorrectAnswers);
        // Save the result after the quiz ends
        setShowFinalScore(true)
      }
    }, 2200); // Clear feedback message after 2 seconds (or adjust the time as needed)
  };


  const saveQuizResult = async (updatedCorrectAnswers) => {
    try {
      if (!user) {
        console.error("No authenticated user found.");
        return;
      }
      // console.log(correctAnswers)
      // Calculate percentage score
      const percentageScore = Math.round((updatedCorrectAnswers / quizQuestions.length) * 100);
      setUserSCore(percentageScore)

       // Reference Firestore
      const sermonRef = doc(db, collection,  document);
      const sermonSnap = await getDoc(sermonRef);

      if (!sermonSnap.exists()) {
        throw new Error("Sermon not found!");
      }

      const sermonData = sermonSnap.data();
      const sermonId = sermonQuizId;

      console.log(sermonQuizId);

      // Check if leaderBoard exists
      if (!sermonData[sermonId]?.leaderBoard) {
        await updateDoc(sermonRef, {
          [`${sermonId}.leaderBoard`]: {}
        });
      }

      // Generate unique map ID
      const randomString = Math.random().toString(36).substring(2, 8);
      const mapId = `${randomString}_${user.email.replace("@", "_").replace(".", "_")}`;

      // Get current date and time
      const now = new Date();
      const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
      const time = now.toLocaleTimeString("en-US", { hour12: false });

      // Save to Firestore
      await updateDoc(sermonRef, {
        [`${sermonId}.leaderBoard.${mapId}`]: {
          date,
          email: user.email,
          percentageScore,
          time,
          userId: user.uid
        }
      });

      console.log("Quiz result saved successfully!");
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  return (
    <div>
      <div className="quiz-modal">
        {/* Close button */}
        <div className='times-ctn'>
          <div onClick={() => {
            setIsQuizOpen(false)
            handleQuizClose()
          }}>
            <FaTimes />
          </div>
        </div>

        {quizQuestions.length > 0 ? (
          currentQuestionIndex < quizQuestions.length && !showFinalScore ? (
            <div className="quiz-question">
              <h4>Question {currentQuestionIndex + 1}</h4>
              <p>{quizQuestions[currentQuestionIndex].Question}</p>
              {!feedbackMessage ?
                <div className="options">
                  {["OptionA", "OptionB", "OptionC", "OptionD"].map((optionKey) => (
                    <div>
                      <button
                        key={optionKey}
                        onClick={() =>
                          handleAnswer(
                            quizQuestions[currentQuestionIndex],
                            quizQuestions[currentQuestionIndex][optionKey]
                          )
                        }
                        className='quiz-btns'
                      >
                        {quizQuestions[currentQuestionIndex][optionKey]}
                      </button>
                    </div>
                  ))}
                </div > : <div className="feedback-msg" style={{ color: FeedbackColor }}>{feedbackMessage}</div>
              }
              {/* Display the feedback message */}
              {/* {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>} */}
            </div>
          ) : (
            <div className='quiz-complete-fd'>
              <p>Quiz Complete!</p>
              {/* Render the results */}
              {isQuizComplete && (
                <p className='quiz-score'>
                  {/* You got {correctAnswers} out of {quizQuestions.length} correct */}
                  Your Score is {userScore}%
                </p>
              )}
              {/* "Okay" button to close the modal */}
              <button onClick={handleQuizClose} className='quiz-btns'>Okay</button>
            </div>
          )
        ) : (
          <p className='no-quiz'>No questions available for this quiz.</p>
        )}
      </div>
    </div>
  )
}

export default TriviaGame