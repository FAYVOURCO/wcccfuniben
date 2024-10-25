import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'  // Import hamburger and close icons
import WccrmLogo from '/wccrm-logo.png'
import './header.css'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  }

  return (
    <div className='header-body'>
      <Link to='/'><img alt='wccrm-logo' src={WccrmLogo} className='wccrm-logo' /></Link>

      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes className='icon' /> : <FaBars className='icon' />}
      </div>

      {/* Menu that slides in when menuOpen is true */}
      <div className={`link-pages ${menuOpen ? 'open' : ''}`}>
        <p><Link to='#' className='gen-link' onClick={toggleMenu}>Sermon</Link></p>
        <p><Link to='#' className='gen-link' onClick={toggleMenu}>Bible Trivia</Link></p>
        <p><Link to='/about-us' className='gen-link' onClick={toggleMenu}>About Us</Link></p>
      </div>
    </div>
  )
}

export default Header;
