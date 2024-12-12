import React, { useEffect, useState } from 'react';
import './sermon.css';
import SignIn from '../../components/sign-in/SignIn';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FaPlay, FaPause, FaBackward, FaForward, FaSearch } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import Fuse from 'fuse.js'; // Install Fuse.js for advanced search capabilities with 'npm install fuse.js'
import { FaDownload, FaTimes } from 'react-icons/fa'; // Font Awesome download icon
import { FaEllipsisV } from 'react-icons/fa'; // Material Design horizontal three dots
import { FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaTrash, FaEdit, FaQuestion, FaChevronDown, FaChevronUp, FaBible, FaQuestionCircle } from 'react-icons/fa'; // Font Awesome share alternative icon
import Spinner from '../../components/spinner/Spinner';
import LeaderBoard from '../../components/LeaderBoard/LeaderBoard';
import TriviaGame from '../../components/triviaGame/TriviaGame';
import { useNavigate } from 'react-router-dom';




const Sermon = () => {

    const navigate = useNavigate();



    const [user, setUser] = useState(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [sermons, setSermons] = useState([]);
    const [filteredSermons, setFilteredSermons] = useState([]);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [audioPlayer] = useState(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [sermonPlaying, setSermonPlaying] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true); // New loading state
    const [year, setYear] = useState(""); // Selected year
    const [month, setMonth] = useState(""); // Selected month
    const [years, setYears] = useState([]); // Available years for dropdown
    const [months, setMonths] = useState([]); // Available months for dropdown
    const [newSermon, setNewSermon] = useState({}); // New sermon data state
    const [showModal, setShowModal] = useState(false); // Show modal for adding sermon
    const [isAdmin, setIsAdmin] = useState(false); // State to track admin status
    const [activeSermonId, setActiveSermonId] = useState(null);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedSermon, setEditedSermon] = useState({});
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [isQuizComplete, setIsQuizComplete] = useState(false);
    const [sermonQuizId, setSermonQuizId] = useState("")
    const [leaderBoard, setLeaderBoard] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState(""); // State for feedback message
    const [showFinalScore, setShowFinalScore] = useState(false); // State to show final score
    const [FeedbackColor, setFeedbackColor] = useState("")
    const [minimiseCurrentAudio, setminimiseCurrentAudio] = useState(false)
    // const [userScore, setUserSCore] = useState('')





    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                    setIsEmailVerified(true);
                    fetchSermons();
                    checkIfAdmin(currentUser.uid); // Check if the user is an admin
                } else {
                    setIsEmailVerified(false);
                    setLoading(false)
                }
            } else {
                setUser(null);
                setIsEmailVerified(false);
                setLoading(false)
            }
        });

        return () => unsubscribe();
    }, []);

    // useEffect(()=>{
    //     fetchSermons();

    // },[currentAudio])

    const fetchSermons = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, 'sermonPage', 'sermons');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const sermonsData = docSnap.data();
                const sortedSermons = Object.keys(sermonsData)
                    .map((key) => ({ id: key, ...sermonsData[key] }))
                    .sort((a, b) => new Date(b.dateReleased) - new Date(a.dateReleased));
                setSermons(sortedSermons);
                setFilteredSermons(sortedSermons);
            } else {
                console.log("No sermons found!");
            }
        } catch (error) {
            console.error("Error fetching sermons:", error);
        } finally {
            setLoading(false);
        }
    };



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

    const handleAddSermonClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewSermon({}); // Reset the new sermon data
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewSermon({ ...newSermon, [name]: value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newSermonId = Date.now().toString(); // Generate a unique ID for the sermon

        // Format the date as MM/DD/YYYY
        const formattedDate = formatDate2(newSermon.dateReleased);

        const newSermonWithFormattedDate = {
            ...newSermon,
            dateReleased: formattedDate, // Update the sermon with the formatted date
        };

        try {
            // Get the reference to the existing 'sermons' document
            const docRef = doc(db, 'sermonPage', 'sermons');

            // Update the document by adding the new sermon map
            await setDoc(docRef, {
                [newSermonId]: newSermonWithFormattedDate, // Add new sermon with dynamic ID
            }, { merge: true }); // Use merge to avoid overwriting the existing data

            fetchSermons(); // Re-fetch the sermons after adding
            handleCloseModal(); // Close the modal after submitting
        } catch (error) {
            console.error("Error adding sermon:", error);
        }
    };


    // Helper function to format the date
    const formatDate2 = (date) => {
        const d = new Date(date);
        const month = d.getMonth() + 1; // Months are 0-indexed, so we add 1
        const day = d.getDate();
        const year = d.getFullYear();
        return `${month}/${day}/${year}`; // Return in MM/DD/YYYY format
    };

    useEffect(() => {
        if (sermons && sermons.length > 0) {
            updateYearsAndMonths(sermons);
        }
    }, [sermons]);

    // Dynamically get unique years and months from the sermons data
    const updateYearsAndMonths = (sermons) => {
        const uniqueYears = new Set();
        const uniqueMonths = new Set();

        sermons.forEach(sermon => {
            const [month, , year] = sermon.dateReleased.split('/');
            uniqueYears.add(year);
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthName = monthNames[parseInt(month, 10) - 1];
            uniqueMonths.add(monthName);
        });

        setYears([...uniqueYears].sort((a, b) => b - a)); // Sort years in descending order
        setMonths([...uniqueMonths]); // Keep months sorted in the natural order
    };

    // Update the filter whenever 'year' or 'month' changes
    useEffect(() => {
        handleYearMonthChange();
    }, [year, month]);

    // Modify handleYearMonthChange to handle filtering logic
    const handleYearMonthChange = () => {
        let filtered = sermons;

        if (year) {
            filtered = filtered.filter(sermon => {
                const [month, , releasedYear] = sermon.dateReleased.split('/');
                return parseInt(releasedYear, 10) === parseInt(year);
            });
            setSelectedFilter("All");
            setSearchQuery(""); // Reset search query

        }

        if (month) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            filtered = filtered.filter(sermon => {
                const [sermonMonth] = sermon.dateReleased.split('/');
                const sermonMonthName = monthNames[parseInt(sermonMonth, 10) - 1];
                return sermonMonthName === month;
            });
            setSelectedFilter("All");

        }

        setFilteredSermons(filtered);
    };


    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setYear("");  // Reset year
        setMonth(""); // Reset month
        if (filter === "All") {
            setFilteredSermons(sermons);
        } else {
            const filtered = sermons.filter(sermon => sermon.programme === filter);
            setFilteredSermons(filtered.length ? filtered : []);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredSermons(sermons);
            return;
        }

        const rankedSermons = sermons
            .map((sermon) => {
                // Calculate a basic similarity score for topic and minister name
                const topicScore = sermon.topic.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
                const ministerScore = sermon.minister.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
                return { ...sermon, score: topicScore + ministerScore };
            })
            .filter(sermon => sermon.score > 0) // Filter out sermons with no match
            .sort((a, b) => b.score - a.score); // Sort by highest score

        setFilteredSermons(rankedSermons);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            alert('You have signed out successfully!');
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    };

    const handlePlaySermon = (sermonUrl, sermon) => {
        if (currentAudio !== sermonUrl) {
            setLoading(true); // Start loading when a new sermon is selected
            audioPlayer.src = sermonUrl;

            audioPlayer.oncanplay = () => {
                setLoading(false); // Stop loading when audio is ready to play
                audioPlayer.play();
                setIsPlaying(true);
                setCurrentAudio(sermonUrl);
                setSermonPlaying(sermon);
                console.log(sermon)
            };

            audioPlayer.currentTime = 0;
        } else {
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
            setIsPlaying(!isPlaying);
        }

        // handleGetLeaders(sermonPlaying.LeaderBoard)
        // setSermonQuizId(sermonPlaying.id)
        // setLeaderBoard(sermonPlaying.leaderBoard)
    };



    useEffect(() => {
        setLeaderBoard(sermonPlaying.leaderBoard)
        setSermonQuizId(sermonPlaying.id)

    }, [sermonPlaying])




    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const updateProgress = () => {
            const currentProgress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            setProgress(currentProgress);
        };

        audioPlayer.addEventListener('timeupdate', updateProgress);

        audioPlayer.addEventListener('ended', () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentAudio(null);
        });

        return () => {
            audioPlayer.removeEventListener('timeupdate', updateProgress);
        };
    }, [audioPlayer]);

    const handleProgressChange = (e) => {
        const newTime = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = newTime;
    };

    const handleRewind = () => {
        audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
    };

    const handleFastForward = () => {
        audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
    };

    useEffect(() => {
        return () => {
            audioPlayer.pause();
            audioPlayer.src = "";
        };
    }, [audioPlayer]);

    const handleRemoveCurrentAudio = () => {
        audioPlayer.pause();
        audioPlayer.src = "";
        setCurrentAudio(null);
        setminimiseCurrentAudio(false)
        setIsPlaying(false);
        setProgress(0)
        if (showSharePopup === true) {
            setShowSharePopup(false);
        }
    }
    const handleMinimiseCurrentAudio = () => {
        setminimiseCurrentAudio(true)
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        const rankedSermons = rankSermons(sermons, e.target.value);
        setFilteredSermons(rankedSermons);
        setYear("");  // Reset year
        setMonth(""); // Reset month
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setFilteredSermons(sermons);
        setSelectedFilter("All");
    };

    const handleCheckInput = () => {
        if (searchQuery.trim() === '') {
            console.log('Input is empty or only contains spaces');
            setFilteredSermons(sermons);
            setSelectedFilter("All");
        } else {
            console.log('Input has content');
        }
    };

    // Define the ranking function
    const rankSermons = (sermons, query) => {
        if (!query) return sermons;

        // Normalize the query
        const normalizedQuery = query.toLowerCase().trim();
        const queryTokens = normalizedQuery.split(/\s+/);

        // Create a Fuse instance for advanced search
        const fuse = new Fuse(sermons, {
            keys: ['topic', 'minister'],
            includeScore: true,
            threshold: 0.4, // Adjust based on how loose/tight you want the matches
        });

        // Get Fuse search results
        const fuseResults = fuse.search(normalizedQuery);

        // Sort results by score (from Fuse.js) and token match count
        const rankedResults = fuseResults.map(result => {
            const sermon = result.item;
            let matchCount = 0;

            // Count matched query tokens in topic and minister fields
            queryTokens.forEach(token => {
                if (sermon.topic.toLowerCase().includes(token) || sermon.minister.toLowerCase().includes(token)) {
                    matchCount += 1;
                }
            });

            return { ...sermon, score: result.score, matchCount };
        });

        // Sort by token match count (higher is better) and then by score (lower is better)
        rankedResults.sort((a, b) => {
            if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
            return a.score - b.score;
        });

        // Return the sorted sermons without scores and match counts
        return rankedResults.map(result => ({
            id: result.id,
            topic: result.topic,
            minister: result.minister,
            dateReleased: result.dateReleased,
            thumbnailUrl: result.thumbnailUrl,
            sermonUrl: result.sermonUrl,
        }));
    };

    const toggleMoreOptions = (sermonId) => {
        setActiveSermonId(prevId => (prevId === sermonId ? null : sermonId));
    };

    const handleShareClick = () => setShowSharePopup(!showSharePopup);


    const handleCopyLink = () => {
        navigator.clipboard.writeText(sermonPlaying.sermonUrl);
        alert("Link copied to clipboard!");
    };


    const handleDeleteSermon = async (sermonId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this sermon?");
        if (confirmDelete) {
            try {
                const docRef = doc(db, 'sermonPage', 'sermons');
                const sermonDoc = await getDoc(docRef);

                if (sermonDoc.exists()) {
                    const sermonData = sermonDoc.data();
                    delete sermonData[sermonId]; // Remove the sermon from the data object

                    await setDoc(docRef, sermonData); // Update Firestore with the new data
                    setSermons((prevSermons) => prevSermons.filter(sermon => sermon.id !== sermonId));
                    setFilteredSermons((prevFilteredSermons) => prevFilteredSermons.filter(sermon => sermon.id !== sermonId));
                } else {
                    console.log("No sermons found!");
                }
            } catch (error) {
                console.error("Error deleting sermon:", error);
            }
        }
    };

    const handleEditClick = (sermon) => {
        setIsEditing(true);
        setEditedSermon(sermon); // Prepopulate the form with the selected sermon details
        setActiveSermonId(null)
    };

    const handleUpdateSermon = async () => {
        const updateSermon = window.confirm("Are you sure you want to make these changes?");


        try {
            const docRef = doc(db, 'sermonPage', 'sermons');
            const docSnap = await getDoc(docRef);

            if (updateSermon && docSnap.exists()) {
                const sermonsData = docSnap.data();
                sermonsData[editedSermon.id] = { ...editedSermon }; // Update sermon details

                await setDoc(docRef, sermonsData); // Save updates to Firestore
                setSermons((prevSermons) =>
                    prevSermons.map((sermon) => sermon.id === editedSermon.id ? editedSermon : sermon)
                );
                setFilteredSermons((prevFilteredSermons) =>
                    prevFilteredSermons.map((sermon) => sermon.id === editedSermon.id ? editedSermon : sermon)
                );
            } else {
                console.log("No sermons found!");
            }

            setIsEditing(false); // Close edit mode
        } catch (error) {
            console.error("Error updating sermon:", error);
        }
    };

    // const handleGetSermon = async (sermonId) => {
    //     setSermonQuizId(sermonId)
    //     // console.log(quizQuestions)
    //     try {
    //         const docRef = doc(db, 'sermonPage', 'sermons');
    //         const docSnap = await getDoc(docRef);
    //         if (docSnap.exists()) {
    //             const sermonData = docSnap.data()[sermonId];
    //             setLeaderBoard(Object.values(sermonData.leaderBoard || {})); // Assuming `quiz` contains the question
    //         }
    //     } catch (error) {
    //         console.error("Error loading quiz:", error);
    //     }
    // };


    const handleOpenQuiz = async (sermonId) => {
        setSermonQuizId(sermonPlaying.id)
        console.log(sermonPlaying.id)
        setLoading(true)
        setQuizQuestions(Object.values(sermonPlaying.Quiz || {})); // Assuming `quiz` contains the questions
        setIsQuizOpen(true);
        setminimiseCurrentAudio(false)
        setCurrentQuestionIndex(0);
        setLoading(false)
        console.log('quiz')
        // console.log(quizQuestions)
        // try {
        //     const docRef = doc(db, 'sermonPage', 'sermons');
        //     const docSnap = await getDoc(docRef);
        //     if (docSnap.exists()) {
        //         const sermonData = docSnap.data()[sermonId];
        //         setQuizQuestions(Object.values(sermonData.Quiz || {})); // Assuming `quiz` contains the questions
        //         setIsQuizOpen(true);
        //         setminimiseCurrentAudio(false)
        //         setCurrentQuestionIndex(0);
        //         setLoading(false)
        //         console.log('quiz')
        //     }
        // } catch (error) {
        //     console.error("Error loading quiz:", error);
        // }
    };

    // const handleAnswer = (question, selectedAnswer) => {
    //     let updatedCorrectAnswers = correctAnswers; // Local variable to track updated count

    //     if (selectedAnswer === question.CorrectAnswer) {
    //         updatedCorrectAnswers += 1; // Increment the local variable
    //         setCorrectAnswers(updatedCorrectAnswers); // Update state asynchronously
    //         setFeedbackMessage("Correct!"); // Set the correct feedback message
    //         setFeedbackColor("green")
    //     } else {
    //         setFeedbackMessage(`Incorrect! The correct answer is: ${question.CorrectAnswer}`); // Set the incorrect feedback message
    //         setFeedbackColor("red")

    //     }

    //     // Move to the next question or mark quiz as complete
    //     setTimeout(() => {
    //         // Clear feedback message after a short delay when moving to the next question
    //         setFeedbackMessage("");

    //         if (currentQuestionIndex < quizQuestions.length - 1) {
    //             setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    //         } else {
    //             setIsQuizComplete(true);
    //             // setIsQuizOpen(false); 
    //             // Close the quiz modal
    //             setCorrectAnswers(0);
    //             saveQuizResult(updatedCorrectAnswers);
    //             // Save the result after the quiz ends
    //             setShowFinalScore(true)
    //         }
    //     }, 2200); // Clear feedback message after 2 seconds (or adjust the time as needed)
    // };

    const handleQuizClose = () => {
        setIsQuizOpen(false); // Close the quiz modal when "Okay" is clicked
        setShowFinalScore(false)
    };

    useEffect(() => {
        setSermonQuizId(sermonPlaying.id)

    }, [showFinalScore])

    // const saveQuizResult = async (updatedCorrectAnswers) => {
    //     try {
    //         if (!user) {
    //             console.error("No authenticated user found.");
    //             return;
    //         }
    //         // console.log(correctAnswers)
    //         // Calculate percentage score
    //         const percentageScore = Math.round((updatedCorrectAnswers / quizQuestions.length) * 100);
    //         setUserSCore(percentageScore)


    //         // Reference Firestore
    //         const sermonRef = doc(db, "sermonPage", "sermons");
    //         const sermonSnap = await getDoc(sermonRef);

    //         if (!sermonSnap.exists()) {
    //             throw new Error("Sermon not found!");
    //         }

    //         const sermonData = sermonSnap.data();
    //         const sermonId = sermonQuizId;

    //         // Check if leaderBoard exists
    //         if (!sermonData[sermonId]?.leaderBoard) {
    //             await updateDoc(sermonRef, {
    //                 [`${sermonId}.leaderBoard`]: {}
    //             });
    //         }

    //         // Generate unique map ID
    //         const randomString = Math.random().toString(36).substring(2, 8);
    //         const mapId = `${randomString}_${user.email.replace("@", "_").replace(".", "_")}`;

    //         // Get current date and time
    //         const now = new Date();
    //         const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
    //         const time = now.toLocaleTimeString("en-US", { hour12: false });

    //         // Save to Firestore
    //         await updateDoc(sermonRef, {
    //             [`${sermonId}.leaderBoard.${mapId}`]: {
    //                 date,
    //                 email: user.email,
    //                 percentageScore,
    //                 time,
    //                 userId: user.uid
    //             }
    //         });

    //         console.log("Quiz result saved successfully!");
    //     } catch (error) {
    //         console.error("Error saving quiz result:", error);
    //     }
    // };


    const handleEditQuiz = (sermonId) => {
        navigate(`/edit-sermon-quiz/${sermonId}`);
    };



    return (
        <div className='sermon-body'>
            <h1 className='sermon-hd'>Sermon <FaBible /></h1>
            {user && isAdmin && (
                <div className="add-sermon" onClick={handleAddSermonClick}>
                    <FaPlus  />
                </div>
            )}

            {/* Modal for adding sermon */}
            {showModal && (
                <div className="add-sermon-modal">
                    <div className="add-sermon-modal-content">
                        <div className='frm-hd'>

                            <h3>Add New Sermon</h3>
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
                                    name="topic"
                                    value={newSermon.topic || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Minister:</label>
                                <input
                                    type="text"
                                    name="minister"
                                    value={newSermon.minister || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Programme:</label>
                                <select
                                    name="programme"
                                    value={newSermon.programme || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Programme</option>
                                    <option value="Sunday Light">Sunday Light</option>
                                    <option value="Charismatic Hour">Charismatic Hour</option>
                                    <option value="Bible Study">Bible Study</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sermon URL:</label>
                                <input
                                    type="url"
                                    name="sermonUrl"
                                    value={newSermon.sermonUrl || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {/* <div className="form-group">
                                <label>Thumbnail URL:</label>
                                <input
                                    type="url"
                                    name="thumbnailUrl"
                                    value={newSermon.thumbnailUrl || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}
                            <div className="form-group">
                                <label>Date Released:</label>
                                <input
                                    type="date"
                                    name="dateReleased"
                                    value={newSermon.dateReleased || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit">Add Sermon</button>
                        </form>
                    </div>
                </div>
            )}

            {user && isEmailVerified ? (
                <>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Try: Sermon title, or mix words like 'Pastor Obed Fasting'"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => {
                                handleSearchChange(e);
                                handleCheckInput(e);
                            }}

                        />
                        <div className='icon-container'>
                            {searchQuery ? (
                                <AiOutlineClose className="clear-icon" onClick={handleClearSearch} />
                            ) : (
                                <FaSearch className="search-icon" />
                            )}</div>
                    </div>

                    <div className="filter-dropdowns">
                        <select value={year} onChange={(e) => { setYear(e.target.value); handleYearMonthChange(); }}>
                            <option value="">Select Year</option>
                            <option value="">All</option>
                            {years.map((yearOption) => (
                                <option key={yearOption} value={yearOption}>{yearOption}</option>
                            ))}
                        </select>

                        <select value={month} onChange={(e) => { setMonth(e.target.value); handleYearMonthChange(); }}>
                            <option value="">Select Month</option>
                            <option value="">All</option>
                            {months.map((monthOption) => (
                                <option key={monthOption} value={monthOption}>{monthOption}</option>
                            ))}
                        </select>
                    </div>

                    {!searchQuery && (
                        <div className="filter-buttons">
                            {["All", "Sunday Light", "Bible Study", "Charismatic Hour", "Other"].map((filter) => (
                                <button
                                    key={filter}
                                    className={`filter-button ${selectedFilter === filter ? 'active-filter' : ''}`}
                                    onClick={() => handleFilterChange(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className='sermon-list'>
                        {filteredSermons.length > 0 ? (
                            filteredSermons.map((sermon) => (
                                <div
                                    key={sermon.id}
                                    className='sermon-item'

                                >
                                    {/* <div className='image-card'
                                        onClick={() => handlePlaySermon(sermon.sermonUrl, sermon)}
                                        style={{ cursor: 'pointer' }}>
                                        <img src={sermon.thumbnailUrl}
                                            alt={sermon.topic}
                                            loading='lazy' 
                                        />
                                    </div> */}
                                    <div className='sermon-info'>
                                        {isEditing && editedSermon.id === sermon.id ? (
                                            <div className='edit-form'>
                                                <input
                                                    type="text"
                                                    value={editedSermon.topic}
                                                    onChange={(e) => setEditedSermon({ ...editedSermon, topic: e.target.value })}
                                                    placeholder="Sermon Topic"
                                                />
                                                <input
                                                    type="text"
                                                    value={editedSermon.minister}
                                                    onChange={(e) => setEditedSermon({ ...editedSermon, minister: e.target.value })}
                                                    placeholder="Minister"
                                                />
                                                <input
                                                    type="text"
                                                    value={editedSermon.sermonUrl}
                                                    onChange={(e) => setEditedSermon({ ...editedSermon, sermonUrl: e.target.value })}
                                                    placeholder="SermonUrl"
                                                />
                                                <input
                                                    type="text"
                                                    value={editedSermon.thumbnailUrl}
                                                    onChange={(e) => setEditedSermon({ ...editedSermon, thumbnailUrl: e.target.value })}
                                                    placeholder="thumbnailUrl"
                                                />
                                                <input
                                                    type="date"
                                                    value={editedSermon.dateReleased}
                                                    onChange={(e) => setEditedSermon({ ...editedSermon, dateReleased: e.target.value })}
                                                    placeholder="Date Released"
                                                />
                                                <button onClick={handleUpdateSermon}>Save</button>
                                                <button onClick={() => setIsEditing(false)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className='abt-sermon' onClick={() => handlePlaySermon(sermon.sermonUrl, sermon)}>
                                                    <h3 >{sermon.topic}</h3>
                                                    <p>{sermon.minister}</p>
                                                    <small>{formatDate(sermon.dateReleased)}</small>
                                                </div>
                                                <div className="more">
                                                    <FaEllipsisV className='more-icon' onClick={() => toggleMoreOptions(sermon.id)} />
                                                </div>
                                            </>
                                        )}


                                    </div>

                                    {activeSermonId === sermon.id && (
                                        <div className='more-options'>
                                            <div
                                                onClick={() => setActiveSermonId(null)}
                                            ><FaTimes /> <small>Close</small></div>
                                            <div><a
                                                href={sermon.sermonUrl}
                                                download
                                                onClick={() => setActiveSermonId(null)} // Close options on click
                                            ><FaDownload /><span>Download</span></a></div>
                                            {/* <div
                                                onClick={() => handleOpenQuiz(sermon.id)}
                                            ><FaQuestion /><span>Quiz</span></div> */}
                                            {/* <div><FaShare /><span>Share</span></div> */}
                                            {isAdmin && (
                                                <>
                                                    <div onClick={() => handleDeleteSermon(sermon.id)}><FaTrash /> Delete</div>
                                                    <div onClick={() => handleEditClick(sermon)}>
                                                        <FaEdit /><span>Edit</span>
                                                    </div>
                                                    <div
                                                        onClick={() => handleEditQuiz(sermon.id)}
                                                    >
                                                        <FaQuestionCircle /><span>Add/Edit Quiz</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>)}
                                </div>
                            ))
                        ) : (
                            <p className='no-match'>No matches found</p>
                        )}
                    </div>




                    {currentAudio && (
                        <div
                            className={`sermon-details-modal ${minimiseCurrentAudio ? 'minimised' : 'maximised'}`}
                        >


                            <div className='audio-controls'>
                                <div className='audio-close-min-opt'>
                                    <div className="minimise">
                                        {

                                            minimiseCurrentAudio ? <FaChevronUp onClick={() => setminimiseCurrentAudio(false)} /> : <FaChevronDown onClick={() => setminimiseCurrentAudio(true)} />

                                        }
                                    </div>
                                    <div className='close-audio' onClick={handleRemoveCurrentAudio}>
                                        <AiOutlineClose className='close-icon' />
                                    </div>
                                </div>

                                <p><strong>{sermonPlaying.topic}</strong> | {sermonPlaying.minister} </p>
                                <div className='control-buttons'>
                                    <button onClick={handleRewind}><FaBackward className='rewind' /></button>
                                    <button onClick={() => {
                                        if (isPlaying) {
                                            audioPlayer.pause();
                                        } else {
                                            audioPlayer.play();
                                        }
                                        setIsPlaying(!isPlaying);
                                    }}>
                                        {isPlaying ? <FaPause className='pause' /> : <FaPlay className='play' />}
                                    </button>
                                    <button onClick={handleFastForward}><FaForward className='ffw' /></button>
                                </div>

                                <div className='progress-bar'>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={handleProgressChange}
                                    />
                                </div>

                                <div className='sermon-ply-option'>
                                    {/* <div onClick={handleShareClick}><FaShare /><span>Share</span></div> */}

                                    <div><a
                                        href={sermonPlaying.sermonUrl}
                                        download
                                        onClick={() => setActiveSermonId(null)} // Close options on click
                                    ><FaDownload /><span>Download</span></a></div>
                                    <div onClick={() => handleOpenQuiz(sermonPlaying.id)} className='take-quiz-btn'> Take Quiz </div>
                                    {/* <div onClick={() => handleOpenQuiz(sermonPlaying.id)} className='take-quiz-btn'><small>Edit Quiz</small></div> */}


                                </div>

                                {showSharePopup && (
                                    <div className='share-popup'>
                                        <AiOutlineClose className='close-share-popup' onClick={handleShareClick} />
                                        <p>Share on:</p>
                                        <div className='share-options'>
                                            <a href={`https://wa.me/?text=${sermonPlaying.sermonUrl}`} target="_blank" rel="noopener noreferrer">
                                                <FaWhatsapp /> WhatsApp
                                            </a>
                                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${sermonPlaying.sermonUrl}`} target="_blank" rel="noopener noreferrer">
                                                <FaFacebook /> Facebook
                                            </a>

                                            <a href={`https://twitter.com/intent/tweet?url=${sermonPlaying.sermonUrl}`} target="_blank" rel="noopener noreferrer">
                                                <FaTwitter /> X
                                            </a>
                                            <a href='#' onClick={handleCopyLink} rel="noopener noreferrer">
                                                <FaCopy /> Copy Link
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* <div className='leader-board'>
                                {leaderBoard && Object.keys(leaderBoard).length > 0 ? (
                                    Object.entries(leaderBoard)
                                        .sort(([, a], [, b]) => {
                                            // Sorting by score, date, and time as before
                                            if (b.percentageScore !== a.percentageScore) {
                                                return b.percentageScore - a.percentageScore;
                                            }
                                            const dateA = new Date(a.date);
                                            const dateB = new Date(b.date);
                                            if (dateA - dateB !== 0) {
                                                return dateA - dateB;
                                            }
                                            const timeA = new Date(`${a.date}T${a.time}`);
                                            const timeB = new Date(`${b.date}T${b.time}`);
                                            return timeA - timeB;
                                        })
                                        .map(([mapId, leaderboardData], index) => {
                                            // Ranking logic
                                            const rank = index + 1;
                                            const suffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";

                                            return (
                                                <div className="leader-board-entry" key={mapId}>
                                                    <h3 className='rank'>{rank}{suffix}</h3>
                                                    <p><strong>Email:</strong> {leaderboardData.email}</p>
                                                    <p><strong>Percentage Score:</strong> {leaderboardData.percentageScore}%</p>
                                                    <p><strong>Time:</strong> {leaderboardData.time}</p>
                                                    <p><strong>Date:</strong> {leaderboardData.date}</p>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className='no-leaders'>No Leaders yet, be the first to complete the quiz!</p> // Message to show if the leaderboard is empty
                                )}
                            </div> */}

                            <LeaderBoard leaderBoard={leaderBoard} />




                            {isQuizOpen && (

                                <div>
                                    <TriviaGame
                                        user={user}
                                        quizQuestions={quizQuestions}
                                        // currentQuestionIndex={currentQuestionIndex}
                                        // showFinalScore={showFinalScore}
                                        // isQuizComplete={isQuizComplete}
                                        // userScore={userScore}
                                        // handleAnswer={handleAnswer}
                                        handleQuizClose={handleQuizClose}
                                        // feedbackMessage={feedbackMessage}
                                        // FeedbackColor={FeedbackColor}
                                        // setIsQuizOpen={setIsQuizOpen}
                                        // setSermonQuizId = {setSermonQuizId}
                                        sermonPlaying={sermonPlaying}
                                        collection='sermonPage'
                                        document='sermons'
                                    />
                                </div>
                                // <div className="quiz-modal">
                                //     {/* Close button */}
                                //     <div className='times-ctn'>
                                //         <div onClick={() => {
                                //             setIsQuizOpen(false)
                                //             handleQuizClose()
                                //         }}>
                                //             <FaTimes />
                                //         </div>
                                //     </div>

                                //     {quizQuestions.length > 0 ? (
                                //         currentQuestionIndex < quizQuestions.length && !showFinalScore ? (
                                //             <div className="quiz-question">
                                //                 <h4>Question {currentQuestionIndex + 1}</h4>
                                //                 <p>{quizQuestions[currentQuestionIndex].Question}</p>
                                //                 {!feedbackMessage ?
                                //                     <div className="options">
                                //                         {["OptionA", "OptionB", "OptionC", "OptionD"].map((optionKey) => (
                                //                             <div>
                                //                                 <button
                                //                                     key={optionKey}
                                //                                     onClick={() =>
                                //                                         handleAnswer(
                                //                                             quizQuestions[currentQuestionIndex],
                                //                                             quizQuestions[currentQuestionIndex][optionKey]
                                //                                         )
                                //                                     }
                                //                                     className='quiz-btns'
                                //                                 >
                                //                                     {quizQuestions[currentQuestionIndex][optionKey]}
                                //                                 </button>
                                //                             </div>
                                //                         ))}
                                //                     </div > : <div className="feedback-msg" style={{ color: FeedbackColor }}>{feedbackMessage}</div>
                                //                 }
                                //                 {/* Display the feedback message */}
                                //                 {/* {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>} */}
                                //             </div>
                                //         ) : (
                                //             <div className='quiz-complete-fd'>
                                //                 <p>Quiz Complete!</p>
                                //                 {/* Render the results */}
                                //                 {isQuizComplete && (
                                //                     <p className='quiz-score'>
                                //                         {/* You got {correctAnswers} out of {quizQuestions.length} correct */}
                                //                         Your Score is {userScore}%
                                //                     </p>
                                //                 )}
                                //                 {/* "Okay" button to close the modal */}
                                //                 <button onClick={handleQuizClose} className='quiz-btns'>Okay</button>
                                //             </div>
                                //         )
                                //     ) : (
                                //         <p className='no-leaders'>No questions available for this quiz.</p>
                                //     )}
                                // </div>
                            )}

                        </div>
                    )}
                    {/* {loading && (
                        <div className="loading-overlay">
                            <div className="spinner2"></div>
                            <p>Setting Up</p>
                        </div>
                    )} */}
                </>
            ) : (

                <SignIn />


            )}
            {
                loading && (
                    <Spinner />
                )
            }


        </div>
    );


};

export default Sermon;
