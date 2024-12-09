import React, { useEffect, useState } from 'react';
import './App.css';
import LandingPage from './pages/landing-page/LandingPage';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AboutUs from './pages/about-us/AboutUs';
import Header from './components/header/Header';
import Sermon from './pages/sermon/Sermon';
import PrayerLibrary from './pages/prayer-library/PrayerLibrary';
import BibleTrivia from './pages/bible-trivia/BibleTrivia';
import FourOFour from './pages/404/404';

const ScrollHandler = ({ setIsBlack }) => {
  const location = useLocation(); // Get the current location object
  const currentPath = location.pathname; // Extract the pathname

  const handleScroll = () => {
    if (document.querySelector('.hero-txt')){
      const heroText = document.querySelector('.hero-txt');
      const heroTextBottom = heroText.getBoundingClientRect().bottom;
      const threshold = window.innerHeight / 1;
      // Check if the bottom of the hero text is near the top of the viewport
    if (heroTextBottom < threshold) {
      setIsBlack(true);
    } else {
      setIsBlack(false);
    }
    }
    

    
  };

  const isAbout = () => {
    if (currentPath !== '/') {
      setIsBlack(true);
    } else {
      setIsBlack(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    isAbout();
  }, [currentPath]);

  return null;
};

function App() {
  const [isBlack, setIsBlack] = useState(false);

  return (
    <Router>
      <div className='app-body'>
        <ScrollHandler setIsBlack={setIsBlack} />
        <div className={`frwd ${isBlack ? 'black' : ''}`}>
          <Header />
        </div>
        <Routes>
          <Route path='*' element={ <FourOFour/>} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/sermon" element={<Sermon />} />
          <Route path="/prayer-library" element={<PrayerLibrary />} />
          <Route path="/trivia" element={<BibleTrivia />} />
          <Route path="/about-us" element={<AboutUs />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
