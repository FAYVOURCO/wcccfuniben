import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Update with your Firebase configuration
import './EditQuizPage.css';

const EditQuizPage = () => {
    const { sermonId } = useParams(); // Get the sermonId from the route
    const [quiz, setQuiz] = useState({});
    const [loading, setLoading] = useState(true);
    const [sermonData, setSermonData] = useState({});

    // Fetch the quiz data
    useEffect(() => {
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
        return <div>Loading...</div>;
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
                            <button onClick={() => deleteQuestion(questionId)} className='delete-button'>Delete Question</button>
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

export default EditQuizPage;
