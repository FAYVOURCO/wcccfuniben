import React, { useEffect, useState } from 'react'
import './bible-trivia.css'
import SignIn from '../../components/sign-in/SignIn';
import { auth, db } from '../.././firebase'; // Adjust the path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Spinner from '../../components/spinner/Spinner';
import { FaTimes } from 'react-icons/fa';
import LeaderBoard from '../../components/LeaderBoard/LeaderBoard';
import TriviaGame from '../../components/triviaGame/TriviaGame';
import { FaQuestionCircle} from 'react-icons/fa'; // Font Awesome share alternative icon




const BibleTrivia = () => {
    const [user, setUser] = useState(null); // To store the current user
    const [isEmailVerified, setIsEmailVerified] = useState(false); // To store email verification status
    const [loading, setLoading] = useState(false); // To control loading state
    const [trivias, setTrivias] = useState([]); // To store trivias
    const [openQuiz, setOpenQuiz] = useState(false)
    const [slideQuizOut, setSlideQuizOut] = useState(false)
    const [currentTrivia, setCurrentTrivia] = useState(null)
    const [quizQuestions, setQuizQuestions] = useState([])
    const [isQuizOpen, setIsQuizOpen] = useState(false); // State to track if the quiz modal is open
    const [showFinalScore, setShowFinalScore] = useState(false); // State to show the final score



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                    setIsEmailVerified(true);
                    fetchTrivias()
                    // checkIfAdmin(currentUser.uid); 
                } else {
                    setIsEmailVerified(false);
                }
            } else {
                setUser(null);
                setIsEmailVerified(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // const handleSignOut = async () => {
    //     try {
    //         await signOut(auth);
    //         alert('You have signed out successfully!');
    //     } catch (error) {
    //         console.error('Error signing out: ', error);
    //     }
    // };

    

    const fetchTrivias = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, 'bibleTriviaPage', 'trivias');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const triviaData = docSnap.data();
                const sortedTrivias = Object.keys(triviaData)
                    .map((key) => ({ id: key, ...triviaData[key] }))
                    .sort((a, b) => a.Title.localeCompare(b.Title)); // Sort alphabetically by Title
                setTrivias(sortedTrivias);
                // setFilteredSermons(sortedSermons);
            } else {
                console.log("No sermons found!");
            }
        } catch (error) {
            console.error("Error fetching sermons:", error);
        } finally {
            setLoading(false);
        }

    };

    

    const handleOpenQuiz = (trivia) => {
        setSlideQuizOut(false)
        setOpenQuiz(true)
        setCurrentTrivia(trivia)
        setQuizQuestions(Object.values(currentTrivia.Quiz || {}))
    }


    


    const handleCloseQuiz = () => {
        setSlideQuizOut(true)
    }

//   handleQuizClose = () => {
//         setIsQuizOpen(false); // Close the quiz modal when "Okay" is clicked
//         setShowFinalScore(false)
//     };

    const handleQuizClose = () => {
        setIsQuizOpen(false); // Close the quiz modal when "Okay" is clicked
        setShowFinalScore(false)
        fetchTrivias()
        setCurrentTrivia(currentTrivia)
        console.log('wer')
    };




    return (
        <div className='trivia-body'>
            <h1 className='trivia-hd'>Trivia <FaQuestionCircle/> </h1>

            <div className='trivia-cards' >
                {trivias.map((trivia, index) => (
                    <div key={index} className='trivia-card' 
                    onClick={() =>
                     handleOpenQuiz(trivia)
                     
                     }>
                        <h3>{trivia.Title}</h3>
                    </div>
                ))}
            </div>

            {
                openQuiz && (
                    <div className={`quiz-details-modal ${slideQuizOut ? 'slide-out' : null}`}>
                        <div onClick={() => handleCloseQuiz()} className='close-quiz-modal'>
                            <FaTimes />
                        </div>
                        <h2>Welcome to {currentTrivia.Title} Quiz!</h2>
                        <p className='preamble'>{currentTrivia.Preamble}</p>
                        <button
                            className='start-quiz-btn'

                            onClick={() => {
                                setIsQuizOpen(true)
                                handleOpenQuiz(currentTrivia)
                            }}>Start Quiz</button>

                        <LeaderBoard leaderBoard={currentTrivia.leaderBoard} />

                        {
                            isQuizOpen && (
                                <TriviaGame
                                    user={user}
                                    quizQuestions={
                                        quizQuestions
                                    }
                                    handleQuizClose={handleQuizClose}
                                    sermonPlaying={currentTrivia}
                                    collection={'bibleTriviaPage'}
                                    document={'trivias'}
                                />
                            )
                        }

                    </div>
                )
            }


            {!user && !isEmailVerified && (
                <SignIn />
            )}

            {
                loading && (
                    <Spinner />
                )
            }
        </div>
    );
}

export default BibleTrivia