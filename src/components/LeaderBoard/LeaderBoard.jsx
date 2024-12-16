import React from 'react';
import './LeaderBoard.css';
import GlobeIcon from '/globe.png'


const LeaderBoard = ({ leaderBoard }) => {

   

    return (
        <div className="leaderboard">
            <div className="quiz-board">
                <br />
                <div className='quiz-board-hd-ctn'>
                    <h3 className='quiz-board-hd'>World Quiz Leader Board  </h3>
                    <img src={GlobeIcon} className='globe-icon' />
                </div>
                
            </div>
            {leaderBoard && Object.keys(leaderBoard).length > 0 ? (
                Object.entries(leaderBoard)
                .sort(([, a], [, b]) => {
                    // Sort by highest score
                    if (b.percentageScore !== a.percentageScore) {
                        return b.percentageScore - a.percentageScore;
                    }
                
                    // Parse date and time for comparison
                    const dateTimeA = new Date(`${a.date} ${a.time}`); // Combine date and time
                    const dateTimeB = new Date(`${b.date} ${b.time}`);
                
                    // Sort by most recent date and time
                    return dateTimeB - dateTimeA; // More recent first
                })
                
                
                    .map(([mapId, leaderboardData], index) => {
                        // Ranking logic
                        const rank = index + 1;
                        const suffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";

                        return (
                            <div className="leader-board-entry" key={mapId}>
                                <h3 className="rank">{rank}{suffix}</h3>
                                <p><strong>Username:</strong> {leaderboardData.username}</p>
                                <p><strong>Score:</strong> {leaderboardData.percentageScore}%</p>
                                <p><strong>Time:</strong> {leaderboardData.time}</p>
                                <p><strong>Date:</strong> {leaderboardData.date}</p>
                            </div>
                        );
                    })
            ) : (
                <p className="no-leaders">No Leaders yet, be the first to complete the quiz!</p>
            )}
        </div>
    );
};

export default LeaderBoard;
