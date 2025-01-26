import React from 'react'
import { useEffect, useState } from 'react';
import { FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaTrash, FaEdit, FaQuestion, FaChevronDown, FaChevronUp, FaBible, FaQuestionCircle } from 'react-icons/fa'; // Font Awesome share alternative icon
import { AiOutlineClose } from 'react-icons/ai'; // Ant Design close icon
import { FaPlay, FaPause, FaBackward, FaForward, FaSearch } from 'react-icons/fa';
import { FaDownload, FaTimes } from 'react-icons/fa'; // Font Awesome download icon
import LeaderBoard from '../../components/LeaderBoard/LeaderBoard';
import '../sermon/sermon.css'
import { useLocation } from 'react-router-dom';
import Sermon from '../sermon/Sermon';



const SermonDetails = ({
  // minimiseCurrentAudio,
  // setminimiseCurrentAudio,
  // sermonPlaying,
  audioPlayer,
  isPlaying,
  setIsPlaying,
  progress,
  handleProgressChange,
  handleRewind,
  handleFastForward,
  handleRemoveCurrentAudio,
  handleOpenQuiz,
  isQuizOpen,
  handleQuizClose,
  user,
  user2,
  quizQuestions,
  setActiveSermonId,
  leaderBoard,
  handleShareClick,
  showSharePopup,
  handleCopyLink
}) => {
  const a = null;

  const [minimiseCurrentAudio, setminimiseCurrentAudio] = useState(false)

  const location = useLocation();
    const { sermonPlaying } = location.state || {};

  useEffect(() => {
    // Close the share popup when the sermon details modal is closed
   console.log(sermonPlaying)
  }, []);

  return (
    <>
      <Sermon/>
      {
        a !== null &&(
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

          <div><a
            href={sermonPlaying.sermonUrl}
            download
            onClick={() => setActiveSermonId(null)} // Close options on click
          ><FaDownload /><span>Download</span></a></div>
          <div onClick={() => handleOpenQuiz(sermonPlaying.id)} className='take-quiz-btn'> Take Quiz </div>


        </div>

        {/* {showSharePopup && (
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
        )} */}
      </div>

      <LeaderBoard leaderBoard={leaderBoard} />

      {isQuizOpen && (

        <div>
          <TriviaGame
            user={user}
            user2={user2}
            quizQuestions={quizQuestions}
            handleQuizClose={handleQuizClose}
            sermonPlaying={sermonPlaying}
            collection='sermonPage'
            document='sermons'
          />
        </div>
      )}

    </div>
        )
      }
   
    </>
  )
}

export default SermonDetails