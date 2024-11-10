import React, { useEffect, useState } from 'react';
import './sermon.css';
import SignIn from '../../components/sign-in/SignIn';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaPlay, FaPause, FaBackward, FaForward, FaSearch } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import Fuse from 'fuse.js'; // Install Fuse.js for advanced search capabilities with 'npm install fuse.js'


const Sermon = () => {
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


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                    setIsEmailVerified(true);
                    fetchSermons();
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

    const fetchSermons = async () => {
        try {
            setLoading(true); // Start loading
            const docRef = doc(db, 'sermonPage', 'sermons');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const sermonsData = docSnap.data();
                const sortedSermons = Object.keys(sermonsData)
                    .map((key) => ({ id: key, ...sermonsData[key] }))
                    .sort((a, b) => new Date(b.dateReleased) - new Date(a.dateReleased));

                setSermons(sortedSermons);
                setFilteredSermons(sortedSermons); // Set initial filtered list
                updateYearsAndMonths(sortedSermons); // Set years and months dynamically
            } else {
                console.log("No sermons document found!");
            }
        } catch (error) {
            console.error("Error fetching sermons:", error);
        } finally {
            setLoading(false); // End loading
        }
    };

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
    };




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
        setIsPlaying(false);
        setProgress(0);
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

    return (
        <div className='sermon-body'>
            {/* {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading sermons...</p>
                </div>
            )} */}
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
                                    onClick={() => handlePlaySermon(sermon.sermonUrl, sermon)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className='image-card'>
                                        <img src={sermon.thumbnailUrl} alt={sermon.topic} />
                                    </div>
                                    <div className='sermon-info'>
                                        <h3>{sermon.topic}</h3>
                                        <p>{sermon.minister}</p>
                                        <small>{formatDate(sermon.dateReleased)}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='no-match'>No matches found</p>
                        )}
                    </div>

                    {currentAudio && (
                        <div className='audio-controls'>
                            <p>Listening to: <strong>{sermonPlaying.topic}</strong> | {sermonPlaying.minister} </p>
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
                            <div className='close-audio' onClick={handleRemoveCurrentAudio}>
                                <AiOutlineClose className='close-icon' />
                            </div>
                        </div>
                    )}
                    {loading && (
                        <div className="loading-overlay">
                            <div className="spinner2"></div>
                            <p>Setting Up</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="signin-form">
                    <SignIn />
                </div>
            )}
        </div>
    );


};

export default Sermon;
