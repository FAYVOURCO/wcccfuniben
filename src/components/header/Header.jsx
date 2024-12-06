import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import WccrmLogo from '/wccrm-logo.png';
import './header.css';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Trigger sign-out modal
  const handleSignOutClick = () => {
    setMenuOpen(!menuOpen);

    setShowModal(true);

  };

  // Confirm and sign out
  const confirmSignOut = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
    setShowModal(false); // Close the modal after signing out
  };

  return (
    <div className='header-body'>
      <Link to='/'><img alt='wccrm-logo' src={WccrmLogo} className='wccrm-logo' /></Link>

      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes className='icon' /> : <FaBars className='icon' />}
      </div>

      <div className={`link-pages ${menuOpen ? 'open' : ''}`}>
        <p><Link to='/sermon' className='gen-link' onClick={toggleMenu}>Sermon</Link></p>
        <p><Link to='/prayer-library' className='gen-link' onClick={toggleMenu}>Prayer Library</Link></p>
        {/* <p><Link to='/bible-trivia' className='gen-link' onClick={toggleMenu}>Bible Trivia</Link></p> */}
        <p><Link to='/about-us' className='gen-link' onClick={toggleMenu}>About Us</Link></p>

        {/* Conditionally render Sign Out if user is signed in */}
        {user && (
          <p className='sign-out' onClick={handleSignOutClick}>Sign Out</p>
        )}
      </div>

      {/* Sign Out Confirmation Modal */}
      {showModal && (
        <div className="signout-modal-overlay">
          <div className="signout-modal-content">
            <p>Are you sure you want to sign out?</p>
            <button onClick={confirmSignOut}>Yes</button>
            <button onClick={() => setShowModal(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
