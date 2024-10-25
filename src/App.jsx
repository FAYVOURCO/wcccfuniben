import React, { useEffect, useState } from 'react'
import './App.css'
import LandingPage from './pages/landing-page/LandingPage'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AboutUs from './pages/about-us/AboutUs';
import Header from './components/header/Header';


function App() {
  const [isBlack, setIsBlack] = useState(false);

  const handleScroll = () => {
    const heroText = document.querySelector('.hero-txt');
    const heroTextBottom = heroText.getBoundingClientRect().bottom;
    const threshold = window.innerHeight / 1; // You can adjust this value to determine when the color change happens

    // Check if the bottom of the hero text is near the top of the viewport
    if (heroTextBottom < threshold) {
      setIsBlack(true);
    } else {
      setIsBlack(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation(); // Get the current location object
  const currentPath = location.pathname; // Extract the pathname

  const isAbout = () =>{  
    if (currentPath === '/about-us') {
      setIsBlack(true);
    } else {
      setIsBlack(false);
    }
  }

  useEffect(() => {
    isAbout();
  }, [currentPath]);


  return (
    <div className='app-body'>
      <div className={`frwd ${isBlack ? 'black' : ''}`}>
        <Header />
      </div>
      <Routes>
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>


    </div>
  )
}

export default App
