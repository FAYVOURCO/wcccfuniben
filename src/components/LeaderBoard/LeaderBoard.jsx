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
                        // Sorting by score, date, and time
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
                                <h3 className="rank">{rank}{suffix}</h3>
                                <p><strong>Email:</strong> {leaderboardData.email}</p>
                                <p><strong>Percentage Score:</strong> {leaderboardData.percentageScore}%</p>
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
