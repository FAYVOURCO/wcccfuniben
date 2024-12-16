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
import { FaQuestionCircle } from 'react-icons/fa'; // Font Awesome share alternative icon
import { FaTrash, FaEllipsisV, FaEdit, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';
import EnterUsernameModal from '../../components/EnterUsernameModal/EnterUsernameModal';








const BibleTrivia = () => {

    const navigate = useNavigate();


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
    const [isMoreOpen, setIsMoreOpen] = useState(false)
    const [moreOpenTrivia, setMoreOpenTrivia] = useState('')
    const [isAdmin, setIsAdmin] = useState(false); // State to track if the user is an admin
    const [addQuizInfoShowModal, setAddQuizInfoShowModal] = useState(false); // State to show the add quiz info modalcc
    const [newQuiz, setNewQuiz] = useState({}); // New sermon data state
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuiz, setEditedQuiz] = useState({});
    const [showUserNameModal, setShowUserNameModal] = useState(false)
    const [user2, setUser2] = useState(null)


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                    setIsEmailVerified(true);
                    fetchTrivias()
                    checkIfAdmin(currentUser.uid); // Check if the user is an admin
                    // checkIfAdmin(currentUser.uid); 
                    const userDoc = doc(db, 'users', currentUser.uid);
                    const userSnapshot = await getDoc(userDoc);
                    setUser2(userSnapshot.data())

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        if (!userData.username) {
                            setShowUserNameModal(true); // Show modal if username is missing
                            // console.log('hi')
                        }
                    } else {
                        console.log('User not found in Firestore');
                    }
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

    const checkIfAdmin = async (userId) => {
        try {
            const userDoc = doc(db, 'users', userId); // Get the user document using the auth UID
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setIsAdmin(userData.isAdmin || false); // Set admin status based on Firestore data
            } else {
                console.log("User not found in Firestore");
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false); // Set to false in case of error
        }
    };

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

    const handleQuizClose = async () => {
        setIsQuizOpen(false); // Close the quiz modal when "Okay" is clicked
        setShowFinalScore(false)
        // fetchTrivias()
        // setCurrentTrivia(currentTrivia)
        // console.log('wer')
        try {
            // Fetch the latest trivia data from Firestore
            const docRef = doc(db, 'bibleTriviaPage', 'trivias');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // console.log(currentTrivia.id)
                const triviaData = docSnap.data();
                const updatedTrivia = triviaData[currentTrivia.id];
                console.log(updatedTrivia)
                // Update the currentTrivia state with the latest leaderboard data
                setCurrentTrivia({
                    ...currentTrivia,
                    leaderBoard: updatedTrivia.leaderBoard || [],
                });

                console.log('Leaderboard updated successfully:', updatedTrivia.leaderBoard);
            } else {
                console.error("Trivia document not found!");
            }
        } catch (error) {
            console.error("Error fetching updated trivia data:", error);
        }
    };

    const handleShowMore = (trivia) => {
        isMoreOpen == true ? setIsMoreOpen(false) : setIsMoreOpen(true)
        setMoreOpenTrivia(trivia.id)

    }

    const handleEditQuiz = (QuizId) => {
        navigate(`/edit-quiz/${QuizId}`);
    };


    const handleAddQuizClick = () => {
        setAddQuizInfoShowModal(true);
    };

    const handleCloseModal = () => {
        setAddQuizInfoShowModal(false);
        setNewQuiz({}); // Reset the new sermon data

    };

    // Helper function to format the date
    const formatDate2 = () => {
        const d = new Date();
        const month = d.getMonth() + 1; // Months are 0-indexed, so we add 1
        const day = d.getDate();
        const year = d.getFullYear();
        return `${month}/${day}/${year}`; // Return in MM/DD/YYYY format
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newQuizId = Date.now().toString(); // Generate a unique ID for the sermon
        // Format the date as MM/DD/YYYY
        const formattedDate = formatDate2(newQuiz.dateReleased);

        const newSermonWithFormattedDate = {
            ...newQuiz,
            dateReleased: formattedDate, // Update the sermon with the formatted date
        };


        try {
            // Get the reference to the existing 'sermons' document
            const docRef = doc(db, 'bibleTriviaPage', 'trivias');

            // Update the document by adding the new sermon map
            await setDoc(docRef, {
                [newQuizId]: newSermonWithFormattedDate, // Add new sermon with dynamic ID
            }, { merge: true }); // Use merge to avoid overwriting the existing data

            fetchTrivias(); // Re-fetch the sermons after adding
            handleCloseModal(); // Close the modal after submitting
        } catch (error) {
            console.error("Error adding sermon:", error);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewQuiz({ ...newQuiz, [name]: value });
    };


    const handleDeleteQuiz = async (trivaId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this sermon?");
        if (confirmDelete) {
            try {
                const docRef = doc(db, 'bibleTriviaPage', 'trivias');
                const sermonDoc = await getDoc(docRef);

                if (sermonDoc.exists()) {
                    const sermonData = sermonDoc.data();
                    delete sermonData[trivaId]; // Remove the sermon from the data object

                    await setDoc(docRef, sermonData); // Update Firestore with the new data
                    fetchTrivias(); // Re-fetch the sermons after deleting
                } else {
                    console.log("No sermons found!");
                }
            } catch (error) {
                console.error("Error deleting sermon:", error);
            }
        }
    };

    const handleEditClick = (trivia) => {
        setMoreOpenTrivia(false)
        setIsEditing(true);
        setEditedQuiz(trivia); // Prepopulate the form with the selected sermon details
        // setActiveSermonId(trivia.id)
        console.log(editedQuiz)
    };

    const handleUpdateQuiz = async () => {
        const updateSermon = window.confirm("Are you sure you want to make these changes?");

        setLoading(true)
        try {
            const docRef = doc(db, 'bibleTriviaPage', 'trivias');
            const docSnap = await getDoc(docRef);

            if (updateSermon && docSnap.exists()) {
                const sermonsData = docSnap.data();
                sermonsData[editedQuiz.id] = { ...editedQuiz }; // Update sermon details

                await setDoc(docRef, sermonsData); // Save updates to Firestore
                setTrivias((prevTrivias) =>
                    prevTrivias.map((quiz) => quiz.id === editedQuiz.id ? editedQuiz : quiz)
                );
                // setFilteredSermons((prevFilteredSermons) =>
                //     prevFilteredSermons.map((sermon) => sermon.id === editedSermon.id ? editedSermon : sermon)
                // );
                setLoading(false)
            } else {
                console.log("No sermons found!");
            }

            setIsEditing(false); // Close edit mode
        } catch (error) {
            console.error("Error updating sermon:", error);
        }
    };

    return (
        <div className='trivia-body'>

            {showUserNameModal && (
                <EnterUsernameModal
                    userId={user?.uid}
                    onClose={() => setShowUserNameModal(false)}
                />
            )}

            {user && isAdmin && (
                <div className="add-quiz-btn" onClick={handleAddQuizClick}>
                    <FaPlus />
                </div>
            )}

            {addQuizInfoShowModal && (
                <div className="add-sermon-modal">
                    <div className="add-sermon-modal-content">
                        <div className='frm-hd'>

                            <h3>Add New Trivia</h3>
                            <button className="close" onClick={handleCloseModal}>
                                <AiOutlineClose />
                            </button>

                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* <div className="form-group">
                                <label>Map Name (ID):</label>
                                <input
                                    type="text"
                                    name="mapName"
                                    value={newSermon.mapName || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}
                            <div className="form-group">
                                <label>Topic:</label>

                                <input
                                    type="text"
                                    name="Title"
                                    value={newQuiz.Title || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit">Add Sermon</button>
                        </form>
                    </div>
                </div>
            )}

            <h1 className='trivia-hd'>Trivia <FaQuestionCircle /> </h1>

            <div className='trivia-cards' >
                {trivias.map((trivia, index) => (
                    <div key={index} className='trivia-card'
                    >
                        {isEditing && editedQuiz.id === trivia.id ? (
                            <div className='edit-form'>
                                <input
                                    type="text"
                                    value={editedQuiz.Title}
                                    onChange={(e) => setEditedQuiz({ ...editedQuiz, Title: e.target.value })}
                                    placeholder="Quiz Title"
                                />

                                <button onClick={handleUpdateQuiz}>Save</button>
                                <button onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        ) : (
                            <div onClick={() =>
                                handleOpenQuiz(trivia)
                            }
                                className='trivia-card-title'
                            >
                                <h3>{trivia.Title}</h3>
                            </div>
                        )}


                        <div className='more-options-trivia'
                        >
                            <FaEllipsisV onClick={() => handleShowMore(trivia)} />

                            {
                                isMoreOpen && trivia.id == moreOpenTrivia && (
                                    <div className='more-options-t'>
                                        <div className='more-option-t' onClick={() => handleShowMore(trivia)}><FaTimes />Close</div>
                                        <div className='more-option-t' onClick={() => handleDeleteQuiz(trivia.id)}  ><FaTrash />Delete</div>
                                        {
                                            isAdmin && (
                                                <>
                                                    <div className='more-option-t' onClick={() => handleEditClick(trivia)}><FaEdit />Edit Title</div>
                                                    <div className='more-option-t' onClick={() => handleEditQuiz(trivia.id)}><FaEdit />Add/Edit Quiz</div>
                                                </>
                                            )
                                        }


                                    </div>
                                )
                            }
                        </div>
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
                                    user2={user2}
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