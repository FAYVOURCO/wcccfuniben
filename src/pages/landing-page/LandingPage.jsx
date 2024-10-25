import React from 'react'
import Header from '../../components/header/Header'
import './landing-page.css'
import Footer from '../../components/footer/Footer';
import SermonLogo from '/sermon-logo.png';
import BibleLogo from '/bible-logo.png';

const LandingPage = () => {

   


  return (
    <div className='lnd-pg-bd'>
      <div className='rect-overlay'></div>

      <div className='hero-txt frwd2'>
        <div>
          <h1>WCCCF-UNIBEN</h1>
        </div>

        <div >
          <hr className='hero-txt-line' />
        </div>
        <div>
          <p>A PLACE WHERE STONES OF LIFE</p>
          <p>ARE TURNED INTO PILLOWS</p>
        </div>
      </div>

      <Footer />

      {/* <div className="sermon-quiz-link frwd2">
        <img alt='sermon-logo' src={SermonLogo} className='sermon-logo' />
        <hr className='s-q-l-line' />
        <hr className='s-q-l-line' />
        <hr className='s-q-l-line' />
        <hr className='s-q-l-line' />
        <hr className='s-q-l-line' />
        <img alt='bible-logo' src={BibleLogo} className='sermon-logo' />

      </div> */}

    </div>
  )
}

export default LandingPage