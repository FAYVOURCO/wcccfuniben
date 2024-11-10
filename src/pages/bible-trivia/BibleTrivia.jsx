import React,  { useEffect, useState }from 'react'
import './bible-trivia.css'
import SignIn from '../../components/sign-in/SignIn';
import { auth } from '../.././firebase'; // Adjust the path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';


const BibleTrivia = () => {
    const [user, setUser] = useState(null); // To store the current user
    const [isEmailVerified, setIsEmailVerified] = useState(false); // To store email verification status

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in
                console.log("User is signed in:", currentUser);
                if (currentUser.emailVerified) {
                    setUser(currentUser); // Set the user data
                    setIsEmailVerified(true); // Set the email verified status
                } else {
                    console.log("Email not verified");
                    setIsEmailVerified(false);
                }
            } else {
                // User is signed out
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

    return (
        <div className='sermon-body'>
            <h1>Bible Trivia</h1>
            {user && isEmailVerified ? (
                <>
                    <p>Welcome, {user.email}! Your email is verified.</p>
                    <button onClick={handleSignOut}>Sign Out</button>
                </>
            ) : (
                <>
                    <p>Please sign in or verify your email.</p>
                    <div className='signin-form'>
                        <SignIn />
                    </div>
                </>
            )}
        </div>
    );
}

export default BibleTrivia