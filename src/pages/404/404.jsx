import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa'; // Importing the icon
import './404.css';

const FourOFour = () => {
    return (
        <div className='fof-bdy'>
            <div className='fof-container'>
                <h1 className='h1'>404</h1>
                <p className='p'>Oops! The page you're looking for doesn't exist.</p>
                <div className='fof-image'>
                    <FaExclamationTriangle className='fof-icon' /> {/* Using the icon */}
                </div>
                <p>It seems the page you are trying to reach is missing or was moved.</p>
                <Link to='/'><div className="fof-home-btn"> Back to Homepage </div></Link>
            </div>
        </div>
    );
}

export default FourOFour;
