import React, { useEffect, useState } from 'react'
import './bible-trivia.css'
import SignIn from '../../components/sign-in/SignIn';
import { auth, db } from '../.././firebase'; // Adjust the path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';



const BibleTrivia = () => {
    const [user, setUser] = useState(null); // To store the current user
    const [isEmailVerified, setIsEmailVerified] = useState(false); // To store email verification status
    const [loading, setLoading] = useState(false); // To control loading state
    const [trivias, setTrivias] = useState([]); // To store trivias


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                    setIsEmailVerified(true);
                   fetchTrivias() 
                    // checkIfAdmin(currentUser.uid); 
                } else {
                    setIsEmailVerified(false);
                }
            } else {
                setUser(null);
                setIsEmailVerified(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // const handleSignOut = async () => {
    //     try {
    //         await signOut(auth);
    //         alert('You have signed out successfully!');
    //     } catch (error) {
    //         console.error('Error signing out: ', error);
    //     }
    // };

    const fetchTrivias = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, 'bibleTriviaPage', 'trivias');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const triviaData = docSnap.data();
                const sortedTrivias = Object.keys(triviaData)
                    .map((key) => ({ id: key, ...triviaData[key] }))
                    .sort((a, b) => a.Title.localeCompare(b.Title)); // Sort alphabetically by Title
                setTrivias(sortedTrivias);
                // setFilteredSermons(sortedSermons);
            } else {
                console.log("No sermons found!");
            }
        } catch (error) {
            console.error("Error fetching sermons:", error);
        } finally {
            setLoading(false);
        }
    };

    // Use useEffect to log trivias after they have been updated
    useEffect(() => {
        if (trivias.length > 0) { // Optional: check if trivias is not empty
            console.log(trivias);
        }
    }, [trivias]);

    return (
        <div className='trivia-body'>
            <h1>Bible Trivia</h1>
            <div className='trivia-cards'>
                { trivias.map((trivia, index) => (
                    <div key={index} className='trivia-card'>
                        <h3>{trivia.Title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BibleTrivia