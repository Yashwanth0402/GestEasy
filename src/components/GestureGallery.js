import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import KalmanFilter from 'kalmanjs';
import './GestureGallery.css';

function GestureGallery() {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [cursorX, setCursorX] = useState(window.innerWidth / 2);
  const [cursorY, setCursorY] = useState(window.innerHeight / 2);
  const [buttonBounds, setButtonBounds] = useState({ register: null, login: null });
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const navigate = useNavigate();

  const kalmanX = new KalmanFilter({ R: 0.01, Q: 0.1, x: 0, P: 1 });
  const kalmanY = new KalmanFilter({ R: 0.01, Q: 0.1, x: 0, P: 1 });

  const clickThreshold = 60; // Increase threshold for click sensitivity
  const clickGestureDelay = 800; // Increase delay for click gesture
  const gestureStabilityTime = 300; // Time for gesture to be stable

  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastGestureTime, setLastGestureTime] = useState(0);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const handposeModel = await handpose.load();
        setModel(handposeModel);
      } catch (error) {
        console.error('Error loading Handpose model:', error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (model) {
      const setupCamera = async () => {
        const video = videoRef.current;
        video.width = 640;
        video.height = 480;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            detectHandGesture();
          };
        } catch (error) {
          console.error('Error accessing webcam:', error);
        }
      };

      const detectHandGesture = async () => {
        const video = videoRef.current;

        const detect = async () => {
          if (video.readyState >= 2) {
            const predictions = await model.estimateHands(video);

            if (predictions.length > 0) {
              const hand = predictions[0].landmarks;
              const indexTip = hand[8]; // Index finger tip
              const thumbTip = hand[4]; // Thumb tip

              const rawX = indexTip[0];
              const rawY = indexTip[1];

              const smoothedX = kalmanX.filter(rawX);
              const smoothedY = kalmanY.filter(rawY);

              let newCursorX = (smoothedX / video.width) * window.innerWidth;
              let newCursorY = (smoothedY / video.height) * window.innerHeight;

              setCursorX(Math.max(0, Math.min(newCursorX, window.innerWidth - 20)));
              setCursorY(Math.max(0, Math.min(newCursorY, window.innerHeight - 20)));

              const distance = Math.sqrt(
                Math.pow(thumbTip[0] - indexTip[0], 2) + Math.pow(thumbTip[1] - indexTip[1], 2)
              );

              const currentTime = new Date().getTime();
              if (distance < clickThreshold) {
                if (currentTime - lastGestureTime > gestureStabilityTime && currentTime - lastClickTime > clickGestureDelay) {
                  setLastClickTime(currentTime);
                  handleClickGesture(newCursorX, newCursorY);
                }
                setLastGestureTime(currentTime);
              }
            }
          }
          requestAnimationFrame(detect);
        };
        detect();
      };

      setupCamera();
    }
  }, [model]);

  const handleClickGesture = (cursorX, cursorY) => {
    const { register, login } = buttonBounds;

    if (register && isWithinBounds(cursorX, cursorY, register)) {
      setConfirmationMessage('Gesture detected: Navigating to Register');
      navigate('/register');
    } else if (login && isWithinBounds(cursorX, cursorY, login)) {
      setConfirmationMessage('Gesture detected: Navigating to Login');
      navigate('/login');
    } else {
      setConfirmationMessage('Gesture detected but not on a button');
    }

    // Clear the confirmation message after 2 seconds
    setTimeout(() => {
      setConfirmationMessage('');
    }, 2000);
  };

  const isWithinBounds = (x, y, bounds) => {
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
  };

  useEffect(() => {
    const registerButton = document.getElementById('register-button');
    const loginButton = document.getElementById('login-button');

    if (registerButton) {
      const { left, top, right, bottom } = registerButton.getBoundingClientRect();
      setButtonBounds((prev) => ({ ...prev, register: { left, top, right, bottom } }));
    }

    if (loginButton) {
      const { left, top, right, bottom } = loginButton.getBoundingClientRect();
      setButtonBounds((prev) => ({ ...prev, login: { left, top, right, bottom } }));
    }
  }, []);

  return (
    <div className="gesture-gallery">
      <h1 className="title">Gesture Controlled Art Gallery</h1>
      <video ref={videoRef} style={{ display: 'none' }}></video>
      <div className="cursor" style={{ left: `${cursorX}px`, top: `${cursorY}px` }}></div>

      <div className="button-container">
        <button id="register-button">Register</button>
        <button id="login-button">Login</button>
      </div>

      {/* Display the confirmation message */}
      {confirmationMessage && <div className="confirmation-message">{confirmationMessage}</div>}

      <footer className="footer">
        <p>© 2023 GestEasy Art Gallery. All rights reserved. Privacy Policy</p>
      </footer>
    </div>
  );
}

export default GestureGallery;
