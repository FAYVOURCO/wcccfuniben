import React, { useEffect, useState } from 'react';
import './prayer-library.css';
import SignIn from '../../components/sign-in/SignIn';
import { auth } from '../.././firebase'; // Adjust the path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Spinner from '../../components/spinner/Spinner';

const PrayerLibrary = () => {
    const [user, setUser] = useState(null); // To store the current user
    const [isEmailVerified, setIsEmailVerified] = useState(false); // To store email verification status
    const [isLoading, setIsLoading] = useState(true); // Loading state for folder

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                console.log("User is signed in:", currentUser);
                if (currentUser.emailVerified) {
                    setUser(currentUser); // Set the user data
                    setIsEmailVerified(true); // Set the email verified status
                } else {
                    console.log("Email not verified");
                    setIsEmailVerified(false);
                }
            } else {
                console.log("No user is signed in");
                setUser(null); // Reset the user data
                setIsEmailVerified(false); // Reset email verification status
            }
        });

        // Clean up the listener on unmount
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            alert('You have signed out successfully!');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    const handleIframeLoad = () => {
        setIsLoading(false); // Stop showing spinner once iframe loads
    };

    return (
        <div className='prayer-lib-body'>
           
                <>
                    {isLoading && (
                        <div className="spinner-container">
                            <Spinner />
                        </div>
                    )}
                    <div className="drive-folder" >
                        <iframe
                            src="https://drive.google.com/embeddedfolderview?id=16VJm1ILTvTunukKD18UPwguV-GvhSuWx#list"
                            onLoad={handleIframeLoad}
                            title="Prayer Library Folder"
                        ></iframe>
                    </div>
                </>
           
        </div>
    );
};

export default PrayerLibrary;
