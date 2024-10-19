import React, { useState } from 'react';
import './Register.css';
import defaultRegisterImage from '../images/register1.png'; // Update with your image path
import { auth } from '../firebase'; // Ensure this path is correct
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the function

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      setError('');

      // Clear input fields after successful registration
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already in use. Please try logging in.");
      } else {
        setError(error.message);
      }
      console.error("Error registering:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <nav className="navbar">
        <h2>GestEasy Art Gallery</h2>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/artist-login">Artist Login</a></li>
          <li><a href="/about">About Us</a></li>
        </ul>
      </nav>

      <div className="register-main-content">
        <div className="register-left-section">
          <h2>Welcome to GestEasy!</h2>
          <img src={defaultRegisterImage} alt="Register" className="default-register-image" />
        </div>

        <div className="register-form-box">
          <h3>Register for GestEasy</h3>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">Registration successful! You can now log in.</p>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Create a Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="register-button">Register Now</button>
            </form>
          )}
          <p>If you already have an account, <a href="/login">log in here</a>.</p>
        </div>
      </div>

      <footer className="footer">
        <p>© 2023 Art Gallery. All rights reserved. Privacy Policy</p>
      </footer>
    </div>
  );
};

export default Register;
