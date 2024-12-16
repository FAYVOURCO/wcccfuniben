import React from 'react'
import YtLogo from '/yt-logo.png'
import FbLogo from '/fb-logo.png'
import WhatsAppLogo from '/whatsapp-logo.png'
import './footer.css'
import { FaDownload } from 'react-icons/fa'; // Font Awesome download icon
import WccrmLogo from '/wccrm-logo.png'


const Footer = () => {
  return (
    <div>
      {/* <div className='get-andriod-app frwd2'>
        <h2>GET OUR ANDRIOD APP</h2>
        <p className='grow'>Grow daily in Christ by staying updated with activities in the fellowship from anywhere 24/7</p>
        <div className='dwnld-btn'>Download <FaDownload /></div>
      </div> */}

      <div className="social-media frwd2">
        <div className='social-media-child'>
          {/* <h2>Keep up with us on Social Media</h2> */}
          <div className='social-links'>
            <a href='https://www.youtube.com/@wcccfuniben' target='_blank' rel='noopener noreferrer'><img alt='yt-logo' src={YtLogo} className='social-icon' /></a>
            <a href='https://www.facebook.com/WCCCFUNIBEN' target='_blank' rel="noopener noreferrer"><img alt='fb-logo' src={FbLogo} className='social-icon' /></a>
            <a href='https://wa.me/2347045064214' target='_blank' rel="noopener noreferrer"><img alt='whatsApp-logo' src={WhatsAppLogo} className='social-icon' /></a>
          </div>
        </div>
      </div>

      <div className='owner frwd2'>
        <br/>
        <div className='wcccf'>
          {/* <img alt='wccrm-logo' src = {WccrmLogo} className='wccrm-footer-logo' /> */}

          {/* <div>
            <h3>Watchman Catholic Charismatic Campus Fellowship </h3>
            <p className='uniben'>UNIBEN, UBTH Chapter</p>
          </div> */}
        </div>

        <small className='copyright'>© Copyright Watchman Catholic Charismatic Campus UNIBEN 2024. All Right Reserved. <br/> <br/>Developed by WCCCF Media Team in partnership with <a className='fay' href='https://www.linkedin.com/company/fayvourco-networks' target='_blank'>FayvourCo. Networks</a>
        .</small>

      </div>

    </div>
  )
}

export default Footer