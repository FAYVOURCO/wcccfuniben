import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './EditSermonQuizPage.css';
import { FaTrash, FaEllipsisV } from 'react-icons/fa';
import Spinner from '../../components/spinner/Spinner';
import { auth, db } from '../../firebase'; // Update with your Firebase configuration
import { onAuthStateChanged } from 'firebase/auth';


const EditSermonQuizPage = () => {
    const { sermonId } = useParams(); // Get the sermonId from the route
    const [quiz, setQuiz] = useState({});
    const [loading, setLoading] = useState(true);
    const [sermonData, setSermonData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [user2, setUser2] = useState(null);


    const navigate = useNavigate();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    // setUser(currentUser);
                    setIsEmailVerified(true);
                     checkIfAdmin(currentUser.uid); 
                     // Check if the user is an admin
                    
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

    const checkIfAdmin = async (userId) => {
        try {
            const userDoc = doc(db, 'users', userId); // Get the user document using the auth UID
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const isAdminUser = userData.isAdmin || false;
                setIsAdmin(isAdminUser);

                if (!isAdminUser) {
                    navigate('/'); // Redirect non-admins to the homepage
                }
            } else {
                console.log('User not found in Firestore');
                setIsAdmin(false);
                navigate('/'); // Redirect non-admins to the homepage
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
            navigate('/'); // Redirect non-admins to the homepage
        }
    };


       
    // Fetch the quiz data
    useEffect(() => {
        
        // setLoading(true)
        const fetchQuiz = async () => {
            try {
                const docRef = doc(db, 'sermonPage', 'sermons');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const sermonData = docSnap.data()[sermonId];
                    setSermonData(sermonData);
                    if (sermonData?.Quiz) {
                        setQuiz(sermonData.Quiz);
                    } else {
                        console.error('Quiz not found for the specified sermon.');
                    }
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Error fetching quiz:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [sermonId]);

    // Handle change for quiz fields
    const handleFieldChange = (questionId, field, value) => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            [questionId]: {
                ...prevQuiz[questionId],
                [field]: value,
            },
        }));
    };

    // Add a new question
    const addNewQuestion = () => {
        const newQuestionId = `Question${Object.keys(quiz).length + 1}`;
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            [newQuestionId]: {
                CorrectAnswer: '',
                OptionA: '',
                OptionB: '',
                OptionC: '',
                OptionD: '',
                Question: '',
            },
        }));
    };

    // Delete a question from the quiz
    const deleteQuestion = async (questionId) => {
        // Show confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete this question?');

        if (confirmDelete) {
            const updatedQuiz = { ...quiz };
            delete updatedQuiz[questionId]; // Remove the question from state

            try {
                const docRef = doc(db, 'sermonPage', 'sermons');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Update Firestore by setting the new quiz data (without the deleted question)
                    const updatedSermonData = {
                        ...docSnap.data(),
                        [sermonId]: {
                            ...docSnap.data()[sermonId],
                            Quiz: updatedQuiz,
                        },
                    };

                    await setDoc(docRef, updatedSermonData);
                    alert('Question deleted successfully!');
                    setQuiz(updatedQuiz); // Update state after successful deletion
                }
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    // Save changes to Firestore
    const saveChanges = async () => {
        const confirmSave = window.confirm('Are you sure you want to save the changes?');

        if (confirmSave) {
            try {
                const docRef = doc(db, 'sermonPage', 'sermons');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const updatedSermonData = {
                        ...docSnap.data(),
                        [sermonId]: {
                            ...docSnap.data()[sermonId],
                            Quiz: quiz,
                        },
                    };

                    // Update Firestore with the new quiz data
                    await setDoc(docRef, updatedSermonData);
                    alert('Changes saved successfully!');
                }
            } catch (error) {
                console.error('Error saving changes:', error);
            }
        } else {
            console.log('Changes were not saved.');
        }
    };

    if (loading) {
        return <Spinner/>;
    }

    // Sort quiz questions by questionId to display them in order
    const sortedQuestions = Object.entries(quiz).sort(([aId], [bId]) => {
        return parseInt(aId.replace('Question', '')) - parseInt(bId.replace('Question', ''));
    });

    return (
        <div className="edit-quiz-page-bd">
            <h1>Edit Quiz</h1>
            <h2>{sermonData.topic}</h2>
            <p>{sermonData.minister}</p>
            <div>
                {sortedQuestions.map(([questionId, questionData], index, array) => (
                    <>
                    <div key={questionId} className="question-card">
                        <h3>{questionId}</h3>
                        <textarea
                            value={questionData.Question}
                            onChange={(e) =>
                                handleFieldChange(questionId, 'Question', e.target.value)
                            }
                            placeholder="Question"
                            rows="4" // Optional: Adjusts the number of visible lines in the textarea
                            cols="50" // Optional: Adjusts the width of the textarea
                        />
                        <input
                            type="text"
                            value={questionData.OptionA}
                            onChange={(e) =>
                                handleFieldChange(questionId, 'OptionA', e.target.value)
                            }
                            placeholder="Option A"
                        />
                        <input
                            type="text"
                            value={questionData.OptionB}
                            onChange={(e) =>
                                handleFieldChange(questionId, 'OptionB', e.target.value)
                            }
                            placeholder="Option B"
                        />
                        <input
                            type="text"
                            value={questionData.OptionC}
                            onChange={(e) =>
                                handleFieldChange(questionId, 'OptionC', e.target.value)
                            }
                            placeholder="Option C"
                        />
                        <input
                            type="text"
                            value={questionData.OptionD}
                            onChange={(e) =>
                                handleFieldChange(questionId, 'OptionD', e.target.value)
                            }
                            placeholder="Option D"
                        />
                        <input
                            type="text"
                            value={questionData.CorrectAnswer}
                            onChange={(e) =>
                                handleFieldChange(questionId, 'CorrectAnswer', e.target.value)
                            }
                            placeholder="Correct Answer"
                        />
                        {/* Show delete button only for the last question */}
                        {index === array.length - 1 && (
                            <button onClick={() => deleteQuestion(questionId)} className='delete-button'><FaTrash/></button>
                        )}
                        
                    </div>
                    <br/>
                    <br/>

                   </>
                ))}
            </div>
            <button onClick={addNewQuestion} className='add-button'>Add New Question</button>
            <button onClick={saveChanges} className='save-button'>Save Changes</button>

            
        </div>
    );
};

export default EditSermonQuizPage;
