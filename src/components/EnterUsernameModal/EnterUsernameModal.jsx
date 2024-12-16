import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import based on your firebase config location
import './EnterUsernameModal.css'
import Spinner from '../spinner/Spinner';

const EnterUsernameModal = ({ userId, onClose }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }

        try {
            setLoading(true)
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, { username });
            onClose(); // Close the modal after saving
        } catch (err) {
            console.error('Error saving username:', err);
            setError('Failed to save username. Please try again.');
            setLoading(false)
        }
    };

    return (
        <div className="modal-backdrop">
            {
                loading ? (
                    <Spinner />
                ) : (
                    <div className="modal">
                        <h2>Enter a Username</h2>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                        {error && <p className="error">{error}</p>}
                        <button onClick={handleSave}>Save</button>
                        {/* <button onClick={onClose}>Cancel</button> */}
                    </div>

                )
            }


        </div>
    );
};

export default EnterUsernameModal;
