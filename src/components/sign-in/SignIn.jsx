import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './sign-in.css';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-up and sign-in modes
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle for forgot password mode
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(false); // Loading state for email sign-in/sign-up
  const [loadingGoogle, setLoadingGoogle] = useState(false); // Loading state for Google sign-in
  const [resetEmailSent, setResetEmailSent] = useState(false); // State to track if reset email is sent
  const [showPassword, setShowPassword] = useState(false); // Password visibility for the password field
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Password visibility for the confirm password field

  const googleProvider = new GoogleAuthProvider();

  // Function to send password reset email
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset the password.');
      return;
    }

    setLoadingEmail(true); // Start loading for email
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true); // Set flag to true once the email is sent
      setError(null);
    } catch (error) {
      setError('Error sending reset email: ' + error.message);
    } finally {
      setLoadingEmail(false); // End loading for email
    }
  };

  // Sign up user with email and password
  const signUpWithEmail = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoadingEmail(true); // Start loading for email
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user); // Send verification email
      alert('Verification email sent. Please check your inbox.')
      setIsSignUp(!isSignUp)
      
      await saveUserToFirestore(result.user);
      setError(null);
    } catch (error) {
      setError('Error signing up: ' + error.message);
    } finally {
      setLoadingEmail(false); // End loading for email
    }
  };

  // Sign in user with email and password
  const signInWithEmail = async () => {
    setLoadingEmail(true); // Start loading for email
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.emailVerified) {
        setUser(result.user);
        await saveUserToFirestore(result.user);
      } else {
        alert('Please verify your email before signing in.');
        signOut(auth); // Sign out if email is not verified
      }
      setError(null);
    } catch (error) {
      setError('Error signing in: ' + error.message);
    } finally {
      setLoadingEmail(false); // End loading for email
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoadingGoogle(true); // Start loading for Google
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.emailVerified) {
        await saveUserToFirestore(user);
        setUser(user);
      } else {
        alert('Please verify your email for this Google account before signing in.');
        signOut(auth); // Sign out if email is not verified for Google users
      }
      setError(null);
    } catch (error) {
      setError('Error signing in with Google: ' + error.message);
    } finally {
      setLoadingGoogle(false); // End loading for Google
    }
  };

  // Save user details to Firestore
  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const currentDate = new Date();
    const dateString = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const timeString = currentDate.toLocaleTimeString('en-US', { hour12: false });

    if (!userDoc.exists()) {
      // New user
      await setDoc(userRef, {
        email: user.email,
        createdAt: dateString,
        lastSignInDate: dateString,
        lastLoginTime: timeString,
      });
    } else {
      // Returning user, update last sign-in
      await setDoc(userRef, {
        lastSignInDate: dateString,
        lastLoginTime: timeString,
      }, { merge: true });
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className='signin-body'>
      {/* Show elements only if not in forgot password mode */}
      {!isForgotPassword && (
        <>
          <h2>{isSignUp ? 'Sign Up With' : 'Sign In With'}</h2>
          <div className='google-signin' onClick={signInWithGoogle} disabled={loadingGoogle}>
            {loadingGoogle ? <p>Loading...</p> : <><FcGoogle /><p>Google</p></>}
          </div>
          <p className='or'>or</p>
        </>
      )}

      <div className='credentials'>
        <p>Email</p>
        <input
          type="email"
          placeholder="jay@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loadingEmail || loadingGoogle}
        />

        {!isForgotPassword && (
          <>
            <div className='credentials-forgot'>
              <small className='ahac' onClick={() => {
                setIsForgotPassword(true)
                setError(null);
                email && setEmail(''); // Clear the email field
                password && setPassword(''); // Clear the password field
                confirmPassword && setConfirmPassword(''); // Clear the confirm password field
                resetEmailSent && setResetEmailSent(false); // Reset the reset email sent flag

              }}>
                Forgot Password?
              </small>
            </div>

            <p>Password</p>

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}  // Dynamically set input type for confirm password                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='password'
                disabled={loadingEmail || loadingGoogle}
              />

              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {isSignUp && (
              <>
                <p>Confirm Password</p>
                <div className="password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}  // Dynamically set input type for confirm password                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loadingEmail || loadingGoogle}
                  />
                  <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

              </>
            )}
          </>
        )}

        {isForgotPassword && (
          <div>
            {resetEmailSent ? (
              <small className='reset-msg'>Password reset email sent! Please check your inbox.</small>
            ) : (
              <>
                <div onClick={handleForgotPassword} disabled={loadingEmail} className='sign-button'>
                  {loadingEmail ? 'Sending Reset Email...' : 'Send Reset Email'}
                </div>
              </>
            )}
            <small onClick={() => {
              setIsForgotPassword(false)
              setError(null);
              email && setEmail(''); // Clear the email field
              password && setPassword(''); // Clear the password field
              confirmPassword && setConfirmPassword(''); // Clear the confirm password field
              resetEmailSent && setResetEmailSent(false); // Reset the reset email sent flag

            }} className='ahac'>

              <p>Back to Sign In</p>
            </small>
          </div>
        )}
      </div>

      {/* Hide the sign-up/sign-in buttons if in forgot password mode */}
      <div className='sign'>
        {!isForgotPassword && (
          <>
            {isSignUp ? (
              <div onClick={() => {
                signUpWithEmail()
                setError(null);
              }} className='sign-button' disabled={loadingEmail}>
                {loadingEmail ? 'Signing Up...' : 'Sign Up'}
              </div>
            ) : (
              <div onClick={() => {
                signInWithEmail()
                setError(null);

              }} className='sign-button' disabled={loadingEmail}>
                {loadingEmail ? 'Signing In...' : 'Sign In'}
              </div>
            )}
          </>
        )}

        {error && <small style={{ color: 'red' }} className='error-msg'>{error}</small>}
      </div>

      {/* Hide the sign-up/sign-in toggle when in forgot password mode */}
      {!isForgotPassword && (
        <div>
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <small onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null);
              email && setEmail(''); // Clear the email field
              password && setPassword(''); // Clear the password field
              confirmPassword && setConfirmPassword(''); // Clear the confirm password field
              resetEmailSent && setResetEmailSent(false); // Reset the reset email sent flag
            }} className='ahac'>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </small>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignIn;
