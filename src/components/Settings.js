import React, { useState } from 'react';
import './Settings.css'; // You can create a specific CSS file or use Landing.css

const Settings = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    // Logic to save settings goes here
    alert('Settings saved!'); // Placeholder alert for demonstration
  };

  return (
    <div className="settings-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h2>GestEasy Art Gallery</h2>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/artist-login">Artist Login</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="settings-content">
        <h1>Settings</h1>
        <form onSubmit={handleSave} className="settings-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="save-button">Save Settings</button>
        </form>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2023 GestEasy Art Gallery. All rights reserved.</p>
          <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
